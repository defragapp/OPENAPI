import React from 'react';

export function Navigation() {
  const links = [
    { to: '/today', label: 'Today' },
    { to: '/explore', label: 'Explore' },
    { to: '/people', label: 'People' },
    { to: '/systems', label: 'Systems' },
    { to: '/library', label: 'Library' },
    { to: '/you', label: 'You' },
  ];

  return (
    <nav className="navigation">
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <a href={link.to}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
