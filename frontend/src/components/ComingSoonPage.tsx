import React from 'react';

const ComingSoonPage: React.FC<{ feature: string }> = ({ feature }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 className="text-3xl font-bold mb-4">{feature}</h1>
    <p className="text-lg text-gray-600">The <span className="font-semibold">{feature}</span> feature is coming soon!</p>
  </div>
);

export default ComingSoonPage;
