<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\CashbookTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Traits\JobAccessTrait;

class JobWorkspacePaymentController extends Controller
{
    use JobAccessTrait;
    public function addPayment(Request $request, Job $job)
    {
        $this->checkGarageAccess($job->garage_id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,card,bank_transfer,credit',
        ]);

        $user = Auth::user();

        DB::beginTransaction();
        try {
            $payment = \App\Models\JobPayment::create([
                'garage_id' => $job->garage_id,
                'job_id' => $job->id,
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'created_by' => $user?->id,
                'created_by_name' => $user?->name ?? 'Staff',
            ]);

            CashbookTransaction::create([
                'garage_id' => $job->garage_id,
                'type' => 'income',
                'amount' => $validated['amount'],
                'category' => 'Advance Payment',
                'description' => "Advance payment for Job #" . $job->id . " (" . ucfirst(str_replace('_', ' ', $validated['payment_method'])) . ")",
                'date' => \Carbon\Carbon::now()->toDateString(),
                'reference_type' => 'JobPayment',
                'reference_id' => $payment->id,
            ]);

            if (\Illuminate\Support\Facades\Schema::hasTable('job_timelines')) {
                \App\Models\JobTimeline::create([
                    'garage_id' => $job->garage_id,
                    'job_id' => $job->id,
                    'user_id' => $user?->id,
                    'action' => 'payment_added',
                    'description' => json_encode([
                        'type' => 'advance_payment',
                        'title' => 'Advance Payment Added',
                        'amount' => (float) $validated['amount'],
                        'method' => $validated['payment_method'],
                        'staff_name' => $user?->name ?? 'Staff',
                    ])
                ]);
            }

            DB::commit();
            return back()->with('success', 'Advance payment added successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Job Advance Payment Error', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to process payment.']);
        }
    }

    public function updatePayment(Request $request, Job $job, \App\Models\JobPayment $payment)
    {
        $this->checkGarageAccess($job->garage_id);

        if ($payment->job_id !== $job->id) {
            abort(404);
        }

        if ($payment->is_void) {
            return back()->withErrors(['error' => 'Cannot edit a voided payment.']);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,card,bank_transfer,credit',
        ]);

        $user = Auth::user();
        $oldAmount = (float) $payment->amount;
        $oldMethod = $payment->payment_method;

        DB::beginTransaction();
        try {
            $payment->update([
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'edited_by' => $user?->id,
                'edited_by_name' => $user?->name ?? 'Staff',
                'edited_at' => now(),
            ]);

            // Sync Cashbook Transaction
            $cashbook = CashbookTransaction::where('reference_type', 'JobPayment')
                ->where('reference_id', $payment->id)
                ->first();

            if ($cashbook) {
                $cashbook->update([
                    'amount' => $validated['amount'],
                    'description' => "Advance payment for Job #" . $job->id . " (" . ucfirst(str_replace('_', ' ', $validated['payment_method'])) . ") [Edited]",
                ]);
            }

            if (\Illuminate\Support\Facades\Schema::hasTable('job_timelines')) {
                \App\Models\JobTimeline::create([
                    'garage_id' => $job->garage_id,
                    'job_id' => $job->id,
                    'user_id' => $user?->id,
                    'action' => 'payment_edited',
                    'description' => json_encode([
                        'type' => 'payment_edited',
                        'title' => 'Payment Updated',
                        'old_amount' => $oldAmount,
                        'new_amount' => (float) $validated['amount'],
                        'old_method' => $oldMethod,
                        'new_method' => $validated['payment_method'],
                        'edited_by' => $user?->name ?? 'Staff',
                        'edited_at' => now()->toDateTimeString(),
                    ])
                ]);
            }

            DB::commit();
            return back()->with('success', 'Payment updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Job Payment Update Error', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to update payment.']);
        }
    }

    public function destroyPayment(Request $request, Job $job, \App\Models\JobPayment $payment)
    {
        $this->checkGarageAccess($job->garage_id);

        if ($payment->job_id !== $job->id) {
            abort(404);
        }

        if ($payment->is_void) {
            return back()->withErrors(['error' => 'Payment is already voided.']);
        }

        $user = Auth::user();
        $reason = $request->input('reason', 'Voided by staff');

        DB::beginTransaction();
        try {
            $payment->update([
                'is_void' => true,
                'voided_by' => $user?->id,
                'voided_by_name' => $user?->name ?? 'Staff',
                'voided_at' => now(),
                'void_reason' => $reason,
            ]);

            // Remove or delete from Cashbook
            CashbookTransaction::where('reference_type', 'JobPayment')
                ->where('reference_id', $payment->id)
                ->delete();

            if (\Illuminate\Support\Facades\Schema::hasTable('job_timelines')) {
                \App\Models\JobTimeline::create([
                    'garage_id' => $job->garage_id,
                    'job_id' => $job->id,
                    'user_id' => $user?->id,
                    'action' => 'payment_voided',
                    'description' => json_encode([
                        'type' => 'payment_voided',
                        'title' => 'Payment Voided / Deleted',
                        'amount' => (float) $payment->amount,
                        'method' => $payment->payment_method,
                        'voided_by' => $user?->name ?? 'Staff',
                        'voided_at' => now()->toDateTimeString(),
                        'reason' => $reason,
                    ])
                ]);
            }

            DB::commit();
            return back()->with('success', 'Payment deleted and voided with audit log.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Job Payment Void Error', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to void payment.']);
        }
    }

    public function updateDiscount(Request $request, Job $job)
    {
        $this->checkGarageAccess($job->garage_id);
        $request->validate(['discount' => 'required|numeric|min:0']);
        $job->update(['discount' => $request->discount]);

        if ($job->invoice) {
            $oldDiscount = $job->invoice->discount ?? 0;
            $oldTotal = max(0, $job->invoice->total_amount - $oldDiscount);

            $job->invoice->discount = $request->discount;
            $job->invoice->save();

            $newTotal = max(0, $job->invoice->total_amount - $request->discount);

            if (\Illuminate\Support\Facades\Schema::hasTable('job_timelines')) {
                \App\Models\JobTimeline::create([
                    'garage_id' => $job->garage_id,
                    'job_id' => $job->id,
                    'user_id' => Auth::id(),
                    'action' => 'correction',
                    'description' => json_encode([
                        'type' => 'discount_updated',
                        'title' => 'Discount Updated',
                        'old_discount' => $oldDiscount,
                        'new_discount' => $request->discount,
                        'old_total' => $oldTotal,
                        'new_total' => $newTotal
                    ])
                ]);
            }
        }

        return back()->with('success', 'Discount updated.');
    }

    public function complete(Job $job)
    {
        $this->checkGarageAccess($job->garage_id);
        
        DB::beginTransaction();
        try {
            $job->status = 'completed';
            $job->save();

            $invoiceNumber = (string) \App\Services\SequenceGenerator::getNextNumber($job->garage_id, 'invoice');

            $invoice = \App\Models\Invoice::firstOrCreate(
                ['job_id' => $job->id, 'garage_id' => $job->garage_id],
                [
                    'invoice_number' => $invoiceNumber,
                    'total_amount' => $job->total_cost,
                    'discount' => $job->discount,
                    'status' => 'pending'
                ]
            );

            if (!$invoice->wasRecentlyCreated) {
                $invoice->update([
                    'total_amount' => $job->total_cost,
                    'discount' => $job->discount
                ]);
            }

            // Transfer advance payments to invoice payments (only active non-voided payments)
            foreach ($job->payments()->where('is_void', false)->get() as $jp) {
                \App\Models\Payment::firstOrCreate(
                    [
                        'invoice_id' => $invoice->id,
                        'amount' => $jp->amount,
                        'payment_method' => $jp->payment_method === 'bank_transfer' ? 'bank' : $jp->payment_method, // map bank_transfer to bank or just keep it
                        'payment_date' => $jp->created_at->toDateString(),
                    ],
                    [
                        'garage_id' => $job->garage_id,
                    ]
                );
            }

            DB::commit();
            return redirect()->route('owner.orders.index')->with('success', 'Job completed and invoice generated. Please collect remaining payment.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Job Completion error', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to complete job.']);
        }
    }
}
