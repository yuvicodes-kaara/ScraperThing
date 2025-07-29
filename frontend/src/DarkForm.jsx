import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "./components/DatePicker";

const DarkForm = () => {
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage("Submitting request...");

    const formatDate = (date) => {
      if (!date) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    let eventSource;
    try {
      eventSource = new EventSource('http://localhost:3000/progress-stream');

      eventSource.onmessage = (event) => {
        const msg = event.data;
        if (msg === "__DONE__") {
          eventSource.close();
          return;
        }
        setLoadingMessage(msg);
      };

      eventSource.onerror = (err) => {
        console.error("SSE error:", err);
        setLoadingMessage("An error occurred.");
        if (eventSource && eventSource.readyState !== 2) {
          eventSource.close();
        }
      };

      const response = await fetch("http://localhost:3000/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q,
          start: formatDate(start),
          end: formatDate(end),
        }),
      });

      if (!response.ok) {
        if (eventSource && eventSource.readyState !== 2) {
          eventSource.close();
        }
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setLoading(false);
      if (eventSource && eventSource.readyState !== 2) {
        eventSource.close();
      }
      navigate("/results", { state: { data } });
    } catch (error) {
      console.error("Error fetching articles:", error);
      setLoadingMessage("Failed to process request.");
      if (eventSource && eventSource.readyState !== 2) {
        eventSource.close();
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Loader overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-auto">
          {/* Blurred background */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-lg"></div>
          {/* Loader and message */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="loader border-t-4 border-white rounded-full w-12 h-12 animate-spin mb-4"></div>
            <p className="text-gray-300 text-lg text-center drop-shadow-lg">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="w-full max-w-md bg-black border border-gray-700 rounded-lg shadow-lg z-10">
        <div className="text-center p-6 pb-0">
          <h1 className="text-2xl font-bold text-white mb-2">Submit Your Request</h1>
          <p className="text-gray-400">Fill out the form below to get started</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="text" className="block text-white text-sm font-medium">
                Query
              </label>
              <input
                id="text"
                type="text"
                placeholder="Enter name of any Company or a person related"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-gray-700 border border-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded-md focus:outline-none focus:border-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-white text-sm font-medium">Start Date</label>
              <DatePicker
                date={start}
                onDateChange={setStart}
                placeholder="Pick a start date"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-white text-sm font-medium">End Date</label>
              <DatePicker
                date={end}
                onDateChange={setEnd}
                placeholder="Pick an end date"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DarkForm;
