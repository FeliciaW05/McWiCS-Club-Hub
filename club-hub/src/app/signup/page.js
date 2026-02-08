"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaTrash } from "react-icons/fa";

export default function Signup() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contacts, setContacts] = useState([{ type: "", url: "" }]);
  const [loading, setLoading] = useState(false);

  const addContact = () => {
    if (contacts.length < 3) {
      setContacts([...contacts, { type: "", url: "" }]);
    }
  };

  const removeContact = (idx) =>
    setContacts(contacts.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Convert contacts array into a links object
    const links = {};
    contacts.forEach(({ type, url }) => {
      if (!type || !url) return;
      links[type.toLowerCase()] = url;
    });

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          tags: [], // optional: auto-generate later
          vibe: [],
          link: links.website || "",
          links,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Club added! ID: " + data.clubId);
        setName("");
        setDescription("");
        setContacts([{ type: "", url: "" }]);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans">
      <div className="fixed inset-0 w-full h-full z-0">
        <img
          src="background_mcgill.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 z-0"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-white/95 p-6 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4">
          <h1 className="text-5xl font-bold mb-4 text-club-dark">
            Sign Up Your Club
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Club Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700"
              required
            />
            <input
              type="text"
              placeholder="Club Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700"
              required
            />

            <div className="flex flex-col gap-2">
              {contacts.map((contact, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={contact.type}
                    onChange={(e) => {
                      const newContacts = [...contacts];
                      newContacts[idx].type = e.target.value;
                      setContacts(newContacts);
                    }}
                    className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 w-28 flex-shrink-0 text-sm"
                  >
                    <option value="">Type</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Website">Website</option>
                  </select>

                  <input
                    type="text"
                    placeholder="URL or handle"
                    value={contact.url}
                    onChange={(e) => {
                      const newContacts = [...contacts];
                      newContacts[idx].url = e.target.value;
                      setContacts(newContacts);
                    }}
                    className="flex-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => removeContact(idx)}
                    className="flex items-center justify-center w-7 h-7 bg-gray-100 rounded border border-gray-300 hover:bg-red-100 transition-colors shrink-0"
                    title="Remove"
                  >
                    <FaTrash className="text-gray-600 hover:text-red-500 text-[12px]" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addContact}
              disabled={contacts.length >= 3}
              className={`mt-2 p-2 font-bold rounded text-white ${
                contacts.length >= 3
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-700 hover:bg-purple-800"
              }`}
            >
              + Add Contact
            </button>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 p-3 bg-club-orange text-white font-bold rounded hover:bg-orange-600"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>

        <Link
          href="/"
          className="mt-6 px-4 py-2 bg-white text-purple-700 font-bold rounded-full hover:bg-gray-100 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
