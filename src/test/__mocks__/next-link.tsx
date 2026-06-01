import React from 'react';

const MockLink = ({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <a href={href} {...props}>
    {children}
  </a>
);

export default MockLink;
