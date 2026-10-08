import React from 'react';
import Select from 'react-select';

export default function SearchableSelect({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select...", 
    isDisabled = false, 
    isClearable = true,
    className = '',
    name
}) {
    const customStyles = {
        control: (base) => ({
            ...base,
            border: '1px solid #cbd5e1',
            boxShadow: 'none',
            '&:hover': { border: '1px solid #94a3b8' },
            borderRadius: '0.5rem',
            minHeight: '2.5rem'
        }),
        input: (base) => ({
            ...base,
            'input:focus': { boxShadow: 'none' }
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999
        })
    };

    // Auto-format options array to { value, label } format
    const formattedOptions = options ? options.map(opt => {
        // If it's already in format, return it
        if (opt.value !== undefined && opt.label !== undefined) return opt;
        
        // Otherwise try to guess common fields
        let label = opt.name || opt.title || opt.vehicle_number || opt.text || 'Unknown';
        
        // Custom format for vehicles or customers if needed
        if (opt.vehicle_number && opt.make) {
            label = `${opt.vehicle_number} (${opt.make} ${opt.model})`;
        } else if (opt.name && (opt.phone || opt.email)) {
            label = `${opt.name} (${opt.phone || opt.email})`;
        }

        return {
            value: opt.id !== undefined ? opt.id : opt.value,
            label: label
        };
    }) : [];

    const selectedOption = formattedOptions.find(opt => opt.value == value) || null;

    const handleChange = (selected) => {
        if (onChange) {
            // Mock the event object so existing handlers work without rewriting them
            onChange({
                target: {
                    value: selected ? selected.value : ''
                }
            });
        }
    };

    return (
        <Select
            className={`text-sm ${className}`}
            styles={customStyles}
            options={formattedOptions}
            value={selectedOption}
            onChange={handleChange}
            placeholder={placeholder}
            isDisabled={isDisabled}
            isClearable={isClearable}
            name={name}
        />
    );
}
