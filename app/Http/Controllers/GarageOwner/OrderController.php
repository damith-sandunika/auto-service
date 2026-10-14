<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Invoice;
use App\Models\Job;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Traits\JobAccessTrait;

class OrderController extends Controller
{
    use JobAccessTrait;
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $garageId = $user->garage_id;
        if ($user->role === 'company_owner' && $request->has('branch_id')) {
            $garageId = $request->query('branch_id');
        }

        $search = trim($request->query('search', ''));
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        // 1. Query Active Invoices
        $invoiceQuery = Invoice::with(['job.vehicle', 'job.owner', 'payments']);

        if ($garageId) {
            $invoiceQuery->where('garage_id', $garageId);
        }
        if ($startDate) {
            $invoiceQuery->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $invoiceQuery->whereDate('created_at', '<=', $endDate);
        }
        if ($search !== '') {
            $cleanSearch = ltrim($search, '#');
            $matchingVehicleIds = \App\Models\Vehicle::where('vehicle_number', 'LIKE', "%{$cleanSearch}%")
                ->orWhere('vehicle_number', 'LIKE', "%{$search}%")
                ->pluck('id');

            $invoiceQuery->where(function ($q) use ($search, $cleanSearch, $matchingVehicleIds) {
                $q->where('invoice_number', $cleanSearch)
                  ->orWhere('invoice_number', 'LIKE', "%{$cleanSearch}%")
                  ->orWhere('id', $cleanSearch)
                  ->orWhereHas('job', function ($jq) use ($search, $matchingVehicleIds) {
                      $jq->whereIn('vehicle_id', $matchingVehicleIds)
                         ->orWhereHas('owner', function ($oq) use ($search) {
                             $oq->where('name', 'LIKE', "%{$search}%")
                                ->orWhere('phone', 'LIKE', "%{$search}%");
                         });
                  });
            });
        }

        $activeInvoices = $invoiceQuery->get();

        // 2. Query Deleted Orders (Anti-Fraud Audit Trail)
        $deletedQuery = \App\Models\DeletedOrder::query();

        if ($garageId) {
            $deletedQuery->where('garage_id', $garageId);
        }
        if ($startDate) {
            $deletedQuery->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $deletedQuery->whereDate('created_at', '<=', $endDate);
        }
        if ($search !== '') {
            $cleanSearch = ltrim($search, '#');
            $deletedQuery->where(function ($q) use ($search, $cleanSearch) {
                $q->where('invoice_number', $cleanSearch)
                  ->orWhere('invoice_number', 'LIKE', "%{$cleanSearch}%")
                  ->orWhere('customer_name', 'LIKE', "%{$search}%")
                  ->orWhere('vehicle_number', 'LIKE', "%{$search}%")
                  ->orWhere('deleted_by_name', 'LIKE', "%{$search}%");
            });
        }

        $deletedOrders = $deletedQuery->get();

        // 3. Map & Merge into a single continuous sequential audit list
        $allOrders = collect();

        foreach ($activeInvoices as $inv) {
            $totalPaid = $inv->payments->reduce(fn($acc, $p) => $acc + (float)$p->amount, 0);
            $fullAmount = (float) $inv->total_amount;
            $balance = max(0, $fullAmount - $totalPaid);

            $allOrders->push([
                'id' => $inv->id,
                'invoice_number' => (int) ($inv->invoice_number ?: $inv->id),
                'display_number' => '#' . ($inv->invoice_number ?: $inv->id),
                'vehicle_plate' => $inv->job?->vehicle?->license_plate ?? $inv->job?->vehicle?->vehicle_number ?? 'Unknown',
                'customer_name' => $inv->job?->owner?->name ?? $inv->job?->vehicle?->owner?->name ?? 'Walk-in Customer',
                'total_amount' => $fullAmount,
                'total_paid' => $totalPaid,
                'balance' => $balance,
                'status' => $inv->status,
                'job_status' => $inv->job?->status ?? 'completed',
                'is_deleted' => false,
                'deleted_by_name' => null,
                'deleted_at' => null,
                'created_at' => $inv->created_at ? $inv->created_at->format('Y-m-d H:i') : null,
            ]);
        }

        foreach ($deletedOrders as $del) {
            $allOrders->push([
                'id' => 'del-' . $del->id,
                'invoice_number' => (int) ($del->invoice_number ?: $del->id),
                'display_number' => '#' . ($del->invoice_number ?: $del->id),
                'vehicle_plate' => $del->vehicle_number ?: 'Unknown',
                'customer_name' => $del->customer_name ?: 'Walk-in Customer',
                'total_amount' => (float) $del->total_amount,
                'total_paid' => 0,
                'balance' => 0,
                'status' => 'deleted',
                'job_status' => null,
                'is_deleted' => true,
                'deleted_by_name' => $del->deleted_by_name ?: 'Staff',
                'deleted_at' => $del->created_at ? $del->created_at->format('M d, Y h:i A') : 'N/A',
                'created_at' => $del->created_at ? $del->created_at->format('Y-m-d H:i') : null,
            ]);
        }

        // Strictly order by sequence number descending
        $sortedOrders = $allOrders->sortByDesc('invoice_number')->values();

        // 4. Paginate
        $page = \Illuminate\Pagination\LengthAwarePaginator::resolveCurrentPage('invoices_page');
        $perPage = 15;
        $currentPageItems = $sortedOrders->slice(($page - 1) * $perPage, $perPage)->values();

        $paginatedOrders = new \Illuminate\Pagination\LengthAwarePaginator(
            $currentPageItems,
            $sortedOrders->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'pageName' => 'invoices_page',
                'query' => $request->query(),
            ]
        );

        $branches = [];
        if ($user->role === 'company_owner') {
            $branches = \App\Models\Garage::where('owner_id', $user->id)->get(['id', 'name']);
        }

        return Inertia::render('GarageOwner/Orders', [
            'invoices' => $paginatedOrders,
            'branches' => $branches,
            'selectedBranchId' => $garageId,
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function store(Request $request, \App\Actions\Orders\CreateOrderAction $createOrderAction)
    {
        $validated = $request->validate([
            'job_id' => 'required|exists:service_jobs,id',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,paid',
        ]);

        $job = \App\Models\Job::findOrFail($validated['job_id']);
        $this->checkGarageAccess($job->garage_id);

        $createOrderAction->execute($validated, $job->garage_id);
        
        return redirect()->back()->with('success', 'Invoice created successfully.');
    }

    public function show(string $id)
    {
        $invoice = Invoice::with(['job.vehicle', 'job.owner', 'job.items.location', 'job.mechanic', 'job.notes', 'payments', 'garage'])->findOrFail($id);
        $this->checkGarageAccess($invoice->garage_id);
        
        $timeline = [];
        if (\Illuminate\Support\Facades\Schema::hasTable('job_timelines')) {
            $timeline = \App\Models\JobTimeline::with('user')->where('job_id', $invoice->job_id)->orderBy('created_at', 'desc')->get();
        }

        return Inertia::render('GarageOwner/Orders/Show', [
            'invoice' => $invoice,
            'timeline' => $timeline
        ]);
    }

    public function edit(string $id)
    {
        $invoice = Invoice::with(['job.vehicle', 'job.owner', 'job.items.location', 'job.mechanic', 'job.payments', 'payments', 'garage'])->findOrFail($id);
        $this->checkGarageAccess($invoice->garage_id);

        $inventory = \App\Models\Inventory::where('garage_id', $invoice->garage_id)->get(['id', 'item_name', 'price', 'quantity']);
        $services = \App\Models\ServiceCatalog::where('garage_id', $invoice->garage_id)->get(['id', 'service_name', 'default_price as price']);
        $suppliers = \App\Models\Supplier::where('garage_id', $invoice->garage_id)->get(['id', 'name', 'phone']);

        return Inertia::render('GarageOwner/Orders/Edit', [
            'invoice' => $invoice,
            'inventory' => $inventory,
            'services' => $services,
            'suppliers' => $suppliers,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $invoice = Invoice::findOrFail($id);
        $this->checkGarageAccess($invoice->garage_id);

        $validated = $request->validate([
            'job_id' => 'required|exists:service_jobs,id',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,paid',
        ]);

        $invoice->update($validated);
        return redirect()->back()->with('success', 'Invoice updated successfully.');
    }

    public function destroy(string $id)
    {
        return DB::transaction(function () use ($id) {
            $invoice = Invoice::with(['job.vehicle', 'job.owner'])->findOrFail($id);
            $this->checkGarageAccess($invoice->garage_id);
            $customerName = $invoice->job?->owner?->name ?? $invoice->job?->vehicle?->owner?->name ?? 'Walk-in Customer';
            $vehicleNumber = $invoice->job?->vehicle?->license_plate ?? $invoice->job?->vehicle?->vehicle_number ?? 'Unknown';
            
            \App\Models\DeletedOrder::create([
                'garage_id' => $invoice->garage_id,
                'invoice_number' => $invoice->invoice_number ?? $invoice->id,
                'customer_name' => $customerName,
                'vehicle_number' => $vehicleNumber,
                'total_amount' => $invoice->total_amount,
                'deleted_by' => Auth::id(),
                'deleted_by_name' => Auth::user()->name,
            ]);

            $invoice->delete();
            
            return redirect()->back()->with('success', 'Order deleted successfully.');
        });
    }

    public function addPayment(Request $request, string $id, \App\Actions\Orders\ProcessPaymentAction $processPaymentAction)
    {
        $invoice = Invoice::findOrFail($id);
        $this->checkGarageAccess($invoice->garage_id);

        $validated = $request->validate([
            'amount'         => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,credit,bank_transfer',
            'payment_date'   => 'nullable|date',
            'redirect_to'    => 'nullable|string',
        ]);

        // Default payment_date to today if not provided
        $validated['payment_date'] = $validated['payment_date'] ?? now()->toDateString();

        $processPaymentAction->execute($invoice, $validated);

        if (!empty($validated['redirect_to'])) {
            return redirect($validated['redirect_to'])->with('success', 'Payment added successfully.');
        }

        return redirect()->back()->with('success', 'Payment added successfully.');
    }

    public function updatePayment(Request $request, string $invoiceId, string $paymentId)
    {
        return DB::transaction(function () use ($request, $invoiceId, $paymentId) {
            $invoice = Invoice::findOrFail($invoiceId);
            $this->checkGarageAccess($invoice->garage_id);

            $payment = \App\Models\Payment::where('invoice_id', $invoice->id)->findOrFail($paymentId);

            $validated = $request->validate([
                'amount' => 'required|numeric|min:0',
                'payment_method' => 'required|string|in:cash,card,bank_transfer,credit',
                'payment_date' => 'nullable|date',
            ]);

            $oldAmount = $payment->amount;
            $oldMethod = $payment->payment_method;

            $payment->update([
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'payment_date' => $validated['payment_date'] ?? $payment->payment_date,
            ]);

            // Update invoice status
            $totalPaid = \App\Models\Payment::where('invoice_id', $invoice->id)->sum('amount');
            $status = $totalPaid >= $invoice->total_amount ? 'paid' : 'pending';
            $invoice->update(['status' => $status]);

            if (\Illuminate\Support\Facades\Schema::hasTable('job_timelines')) {
                $changes = [];
                if ($oldAmount != $validated['amount']) $changes[] = "Amount changed from Rs. {$oldAmount} to Rs. {$validated['amount']}";
                if ($oldMethod != $validated['payment_method']) $changes[] = "Method changed from " . strtoupper($oldMethod) . " to " . strtoupper($validated['payment_method']);
                
                if (count($changes) > 0) {
                    \App\Models\JobTimeline::create([
                        'garage_id' => $invoice->garage_id,
                        'job_id' => $invoice->job_id,
                        'user_id' => Auth::id(),
                        'action' => 'correction',
                        'description' => "Payment corrected: " . implode(', ', $changes),
                    ]);
                }
            }

            return redirect()->back()->with('success', 'Payment corrected successfully.');
        });
    }

    public function updateItem(Request $request, string $invoiceId, string $itemId)
    {
        return DB::transaction(function () use ($request, $invoiceId, $itemId) {
            $invoice = Invoice::findOrFail($invoiceId);
            $this->checkGarageAccess($invoice->garage_id);

            $item = \App\Models\JobItem::where('job_id', $invoice->job_id)->findOrFail($itemId);

            $validated = $request->validate([
                'description' => 'required|string',
                'quantity' => 'required|numeric|min:0.01',
                'price' => 'required|numeric|min:0',
            ]);

            $oldDesc = $item->description;
            $oldQty = (float)$item->quantity;
            $oldPrice = (float)$item->price;
            $newQty = (float)$validated['quantity'];

            // Stock adjustment if item is an inventory part
            if ($item->item_type === 'part' && !empty($item->inventory_id)) {
                $inv = \App\Models\Inventory::where('id', $item->inventory_id)
                    ->where('garage_id', $invoice->garage_id)
                    ->lockForUpdate()
                    ->first();

                if ($inv) {
                    $qtyDelta = $newQty - $oldQty;
                    if ($qtyDelta > 0) {
                        // Consumed more items: ensure available
                        if ($inv->quantity < $qtyDelta) {
                            return back()->withErrors(['quantity' => "Insufficient stock. Only {$inv->quantity} available in inventory."]);
                        }
                        $inv->decrement('quantity', $qtyDelta);
                    } elseif ($qtyDelta < 0) {
                        // Reduced quantity: restore stock
                        $inv->increment('quantity', abs($qtyDelta));
                    }
                }
            }

            $item->update([
                'description' => $validated['description'],
                'quantity' => $validated['quantity'],
                'price' => $validated['price'],
            ]);

            // Recalculate invoice & job total
            $newTotal = \App\Models\JobItem::where('job_id', $invoice->job_id)->sum(\Illuminate\Support\Facades\DB::raw('price * quantity'));
            $invoice->update(['total_amount' => $newTotal]);
            $invoice->job()->update(['total_cost' => $newTotal]);
            $this->updateInvoiceStatus($invoice);

            if (\Illuminate\Support\Facades\Schema::hasTable('job_timelines')) {
                $changes = [];
                if ($oldDesc != $validated['description']) $changes[] = "Name changed to '{$validated['description']}'";
                if ($oldQty != $newQty) $changes[] = "Qty changed from {$oldQty} to {$newQty}";
                if ($oldPrice != (float)$validated['price']) $changes[] = "Price changed from {$oldPrice} to {$validated['price']}";
                
                if (count($changes) > 0) {
                    \App\Models\JobTimeline::create([
                        'garage_id' => $invoice->garage_id,
                        'job_id' => $invoice->job_id,
                        'user_id' => Auth::id(),
                        'action' => 'correction',
                        'description' => "Item '{$oldDesc}' edited: " . implode(', ', $changes),
                    ]);
                }
            }

            return redirect()->back()->with('success', 'Item updated successfully.');
        });
    }

    public function deleteItem(string $invoiceId, string $itemId)
    {
        return DB::transaction(function () use ($invoiceId, $itemId) {
            $invoice = Invoice::findOrFail($invoiceId);
            $this->checkGarageAccess($invoice->garage_id);

            $item = \App\Models\JobItem::where('job_id', $invoice->job_id)->findOrFail($itemId);
            $oldDesc = $item->description;

            // Restore stock if inventory part
            if ($item->item_type === 'part' && !empty($item->inventory_id)) {
                $inv = \App\Models\Inventory::where('id', $item->inventory_id)
                    ->where('garage_id', $invoice->garage_id)
                    ->lockForUpdate()
                    ->first();
                if ($inv) {
                    $inv->increment('quantity', $item->quantity);
                }
            }
            
            $item->delete();

            // Recalculate invoice & job total
            $newTotal = \App\Models\JobItem::where('job_id', $invoice->job_id)->sum(\Illuminate\Support\Facades\DB::raw('price * quantity'));
            $invoice->update(['total_amount' => $newTotal]);
            $invoice->job()->update(['total_cost' => $newTotal]);
            $this->updateInvoiceStatus($invoice);

            if (\Illuminate\Support\Facades\Schema::hasTable('job_timelines')) {
                \App\Models\JobTimeline::create([
                    'garage_id' => $invoice->garage_id,
                    'job_id' => $invoice->job_id,
                    'user_id' => Auth::id(),
                    'action' => 'correction',
                    'description' => "Item '{$oldDesc}' removed from order.",
                ]);
            }

            return redirect()->back()->with('success', 'Item removed successfully.');
        });
    }

    protected function updateInvoiceStatus(Invoice $invoice)
    {
        $totalPaid = (float)\App\Models\Payment::where('invoice_id', $invoice->id)->sum('amount');
        $totalAmount = (float)$invoice->total_amount;

        if ($totalPaid >= $totalAmount && $totalAmount > 0) {
            $status = 'paid';
        } elseif ($totalPaid > 0) {
            $status = 'partial';
        } else {
            $status = 'pending';
        }

        $invoice->update(['status' => $status]);
    }

    public function print(Request $request, string $id)
    {
        $invoice = Invoice::with(['job.vehicle', 'job.owner', 'job.items', 'payments', 'garage'])->findOrFail($id);
        $this->checkGarageAccess($invoice->garage_id);

        if ($request->query('type') === 'thermal') {
            $settings = \App\Models\GarageThermalSetting::where('garage_id', $invoice->garage_id)->first();
            if (!$settings) {
                $settings = new \App\Models\GarageThermalSetting([
                    'paper_width' => '80mm',
                    'font_family' => 'sans-serif',
                    'logo_size'   => 140,
                ]);
            }
            $settings->paper_size = 'thermal';
        } else {
            $settings = \App\Models\GarageInvoiceSetting::where('garage_id', $invoice->garage_id)->first();
        }

        return Inertia::render('GarageOwner/PrintInvoice', [
            'invoice'  => $invoice,
            'settings' => $settings
        ]);
    }
}
