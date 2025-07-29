import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const sentimentColors = {
  positive: 'bg-green-600',
  negative: 'bg-red-600',
  neutral: 'bg-yellow-500',
};

const statusColors = {
  completed: 'bg-green-600',
  active: 'bg-blue-600',
  pending: 'bg-orange-500',
  draft: 'bg-gray-600',
  open: 'bg-blue-600',
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const ResultPage = () => {
  const location = useLocation();
  const data = location.state?.data || [];
  const [openSummaryIdx, setOpenSummaryIdx] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (idx) => {
    setOpenSummaryIdx(idx);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setOpenSummaryIdx(null);
  };

  return (
    <div className={`min-h-screen bg-[#232e3b] flex items-center justify-center p-6 relative ${modalOpen ? 'overflow-hidden' : ''}`}>
      {/* Modal overlay for summary */}
      {modalOpen && openSummaryIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-lg">
          <div className="relative bg-[#1a2332] border border-[#2c3a4d] rounded-xl shadow-lg p-6 mt-24 w-full max-w-lg mx-4">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="font-semibold text-xl mb-2 text-white">Summary</div>
            <div className="text-gray-200 text-base whitespace-pre-line">
              {data[openSummaryIdx]?.summary || 'No summary available.'}
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-6xl bg-[#232e3b] rounded-xl shadow-lg border border-[#2c3a4d]">
        <div className="p-8 pb-2">
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-gray-400 mb-4">Comprehensive overview of Articles</p>
        </div>
        <div className="overflow-x-auto px-8 pb-8">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="bg-[#263143]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Sentiment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Link</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Content</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-8">No data available.</td>
                </tr>
              )}
              {data.map((item, idx) => (
                <React.Fragment key={idx}>
                  <tr className="hover:bg-[#28344a] transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{item.title}</td>
                    <td className="px-4 py-3 text-gray-300">{item.date ? new Date(item.date).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${sentimentColors[item.sentiment?.toLowerCase()] || 'bg-gray-500'}`}>
                        {capitalize(item.sentiment || '-')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${statusColors[item.status?.toLowerCase()] || 'bg-gray-500'}`}>
                        {capitalize(item.status || '-')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{item.source || '-'}</td>
                    <td className="px-4 py-3">
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0 0L10 21l-7-7 11-11z" /></svg>
                        </a>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className={`flex items-center gap-1 px-3 py-1 ${openSummaryIdx === idx && modalOpen ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded transition-colors text-xs font-medium`}
                        onClick={() => handleOpenModal(idx)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View
                      </button>
                    </td>
                  </tr>
                  {openSummaryIdx === idx && (
                    <tr>
                      <td colSpan={7} className="px-4 pb-4 pt-0">
                        <div className="bg-[#1a2332] border border-[#2c3a4d] rounded-lg p-4 mt-2 text-gray-200 shadow-md">
                          <div className="font-semibold text-base mb-1">Summary</div>
                          <div className="text-sm whitespace-pre-line">{item.summary || 'No summary available.'}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;