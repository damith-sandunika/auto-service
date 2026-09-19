<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Models\Inventory;
use App\Models\Garage;
use App\Models\SupplierPayment;
use App\Models\Expense;

class PurchaseController extends Controller
{
    private function getGarage()
    {
        return Garage::where('owner_id', Auth::id())->first() ?? Garage::first();
    }

    public function index()
    {
        $garage = $this->getGarage();
        $purchases = PurchaseOrder::where('garage_id', $garage->id)
            ->with(['supplier', 'items.inventory'])
            ->orderBy('date', 'desc')
            ->paginate(20);
            
        $suppliers = Supplier::where('garage_id', $garage->id)->withCount('purchaseOrders')->orderBy('name')->get();
        $inventories = Inventory::where('garage_id', $garage->id)->orderBy('item_name')->get();

        $totalGRNAmount = PurchaseOrder::where('garage_id', $garage->id)->sum('total_amount');
        $totalPaidAmount = PurchaseOrder::where('garage_id', $garage->id)->sum('paid_amount');
        $totalBalanceDue = PurchaseOrder::where('garage_id', $garage->id)->sum('balance_amount');

        return Inertia::render('GarageOwner/Purchases/Index', [
            'purchases' => $purchases,
            'suppliers' => $suppliers,
            'inventories' => $inventories,
            'totalGRNAmount' => $totalGRNAmount,
            'totalPaidAmount' => $totalPaidAmount,
            'totalBalanceDue' => $totalBalanceDue,
        ]);
    }

    public function store(Request $request, \App\Actions\Purchases\CreatePurchaseOrderAction $createPurchaseOrderAction)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'reference_no' => 'nullable|string',
            'date' => 'required|date',
            'paid_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.inventory_id' => 'required|exists:inventories,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        $garage = $this->getGarage();

        $createPurchaseOrderAction->execute($validated, $garage->id);

        return redirect()->back()->with('success', 'Purchase Order saved and inventory updated.');
    }
}
