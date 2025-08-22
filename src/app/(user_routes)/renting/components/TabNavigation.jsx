import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="-mb-px flex">
        <button
          className={`py-2 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'browse'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Equipment
        </button>
        <button
          className={`py-2 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'my-rentals'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('my-rentals')}
        >
          My Rentals
        </button>
      </nav>
    </div>
  );
};

export default TabNavigation;
