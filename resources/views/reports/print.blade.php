<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ ucfirst($tab) }}_Report_{{ $startDate }}_to_{{ $endDate }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        body { padding: 40px; color: #333; font-size: 11px; background: #fff; }
        
        .letterhead { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .laundry-name { font-size: 28px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px; }
        .laundry-details { font-size: 11px; color: #64748b; line-height: 1.5; }
        
        .report-title { text-align: center; margin-bottom: 20px; }
        .report-title h1 { font-size: 16px; font-weight: bold; letter-spacing: 2px; color: #475569; margin-bottom: 5px; text-transform: uppercase; }
        .report-title p { font-size: 12px; color: #94a3b8; font-weight: 500; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; page-break-inside: auto; }
        th { background: #f1f5f9; color: #475569; text-align: left; padding: 10px 12px; font-size: 10px; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #cbd5e1; }
        th.text-right, td.text-right { text-align: right; }
        th.text-center, td.text-center { text-align: center; }
        td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 11px; }
        tr:nth-child(even) td { background: #fdfdfd; }
        
        .footer { margin-top: 40px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        @media print { .no-print { display: none; } body { padding: 0; } }
    </style>
</head>
<body onload="window.print()">
    <div class="no-print" style="margin-bottom:20px; text-align: right;">
        <button onclick="window.print()" style="padding:10px 20px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;font-weight:bold;">🖨 Print / Save PDF</button>
        <button onclick="window.close()" style="padding:10px 20px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:4px;cursor:pointer;font-size:12px;font-weight:bold;margin-left:10px;">Close</button>
    </div>

    <!-- Letterhead -->
    <div class="letterhead">
        <div class="laundry-name">{{ $garage->name ?? 'GarageSaaS' }}</div>
        <div class="laundry-details">
            @if($garage->address){{ $garage->address }}<br>@endif
            @if($garage->phone)Phone: {{ $garage->phone }}@endif
        </div>
    </div>

    <!-- Title & Date -->
    <div class="report-title">
        <h1>{{ str_replace('_', ' ', $tab) }} REPORT</h1>
        <p>From: {{ \Carbon\Carbon::parse($startDate)->format('M d, Y') }} &nbsp;&nbsp; To: {{ \Carbon\Carbon::parse($endDate)->format('M d, Y') }}</p>
    </div>

    <!-- Data Table -->
    <table>
        <thead>
            <tr>
                @foreach($headers as $header)
                    <th class="{{ $loop->first ? 'text-center' : ($loop->last ? 'text-right' : '') }}">{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $index => $row)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                @foreach(array_slice($row, 1) as $cellIndex => $cell)
                    <td class="{{ $loop->last ? 'text-right' : '' }}" style="{{ $loop->last ? 'font-weight:bold;color:#059669;' : '' }}">{{ $cell }}</td>
                @endforeach
            </tr>
            @empty
            <tr>
                <td colspan="{{ count($headers) }}" class="text-center" style="color:#94a3b8; padding: 20px;">No records found in this date range.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        {{ $garage->name ?? 'GarageSaaS' }} &bull; Report automatically generated on {{ now()->format('M d, Y h:i A') }}
    </div>
</body>
</html>
