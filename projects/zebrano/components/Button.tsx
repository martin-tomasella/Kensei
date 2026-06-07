import React from 'react';
export const Button = ({ children, variant = 'primary' }) => {
  return <button className={\`btn btn-\${variant}\`}>{children}</button>;
};