import React from 'react';
import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen secure-body-background">
      <Navbar />
      <main className="flex-grow container">{children}</main>
    </div>
  );
};

export default Layout;
