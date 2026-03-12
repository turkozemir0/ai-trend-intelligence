"use client";

import { useState } from "react";

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    description: "",
    category: "",
    submitter_email: "",
    company_fax: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Submitted successfully!");
        setFormData({
          name: "",
          website: "",
          description: "",
          category: "",
          submitter_email: "",
          company_fax: "",
        });
      } else {
        setStatus("error");
        setMessage(data.message || "Submission failed. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <h1 className="text-3xl font-bold mb-2">Submit Your AI Tool</h1>
        <p className="text-zinc-400 mb-6">
          Get listed and reach developers, founders, and marketers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="company_fax"
            type="text"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            value={formData.company_fax}
            onChange={(e) => setFormData({ ...formData, company_fax: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium mb-1">Tool Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Website *</label>
            <input
              type="url"
              required
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              required
              maxLength={500}
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
            />
            <div className="text-xs text-zinc-500 mt-1">
              {formData.description.length}/500 characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select a category</option>
              <option value="coding">Coding</option>
              <option value="marketing">Marketing</option>
              <option value="writing">Writing</option>
              <option value="design">Design</option>
              <option value="productivity">Productivity</option>
              <option value="research">Research</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="sales">Sales</option>
              <option value="support">Customer Support</option>
              <option value="data-analysis">Data Analysis</option>
              <option value="automation">Automation</option>
              <option value="education">Education</option>
              <option value="finance">Finance</option>
              <option value="legal">Legal</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Your Email *</label>
            <input
              type="email"
              required
              value={formData.submitter_email}
              onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
          >
            {status === "loading" ? "Submitting..." : "Submit Tool"}
          </button>

          {status === "success" && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
