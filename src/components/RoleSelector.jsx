import React, { useState } from 'react';

const ROLES = [
  'buyer', 'seller', 'both', 'manager', 'sub-agent', 'orchestrator',
  'worker', 'auditor', 'witness', 'notary', 'researcher', 'executor',
  'gatekeeper', 'observer', 'custom',
];

const selectStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
};

export default function RoleSelector({ value, onChange }) {
  const isCustom = !ROLES.slice(0, -1).includes(value) || value === 'custom';
  const selectValue = isCustom && value !== 'custom' ? 'custom' : value;
  const [customText, setCustomText] = useState(isCustom && value !== 'custom' ? value : '');
  const [focused, setFocused] = useState(false);

  const handleSelect = (e) => {
    const v = e.target.value;
    if (v === 'custom') {
      onChange('custom');
      setCustomText('');
    } else {
      onChange(v);
    }
  };

  const handleCustomInput = (e) => {
    setCustomText(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: '#a0a8b8' }}>Agent Role</label>
      <select
        value={selectValue}
        onChange={handleSelect}
        className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none capitalize"
        style={selectStyle}
      >
        {ROLES.map(r => (
          <option key={r} value={r} className="capitalize">
            {r === 'custom' ? 'Custom (enter your own)' : r.charAt(0).toUpperCase() + r.slice(1)}
          </option>
        ))}
      </select>
      {selectValue === 'custom' && (
        <input
          type="text"
          value={customText}
          onChange={handleCustomInput}
          placeholder="Enter custom role name..."
          className="w-full px-4 py-3 mt-2 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${focused ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus
        />
      )}
    </div>
  );
}