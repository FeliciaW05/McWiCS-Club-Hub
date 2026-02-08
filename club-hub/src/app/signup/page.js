"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaTrash } from "react-icons/fa";

export default function Signup() {
  const [contacts, setContacts] = useState([{ type: "", url: "" }]);

  const addContact = () => {
    if (contacts.length < 3) {
      setContacts([...contacts, { type: "", url: "" }]);
    }
  };

  const removeContact = (idx) =>
    setContacts(contacts.filter((_, i) => i !== idx));

  return (
    <div className="min-h-screen relative font-sans">

      {/* Fixed background like homepage */}
      <div className="fixed inset-0 w-full h-full z-0">
        <img
          src="background_mcgill.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 z-0"></div>
      </div>

      {/* Centered form container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">

        <h1 className="text-5xl font-bold mb-6 text-club-dark">
            Join the CL•HUB
        </h1>



        <form className="flex flex-col gap-4 w-full max-w-md bg-white/90 p-6 rounded-lg shadow-lg">

          <input
            type="text"
            placeholder="Club Name"
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700"
          />
          <input
            type="text"
            placeholder="Club Description"
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700"
          />
          <input
            type="email"
            placeholder="Contact Email"
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700"
          />

          {/* Contacts Section */}
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
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded border border-gray-300 hover:bg-red-100 transition-colors"
                  title="Remove"
                >
                  <FaTrash className="text-gray-600 hover:text-red-500 text-sm" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Contact button */}
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
            className="mt-4 p-3 bg-club-orange text-white font-bold rounded hover:bg-orange-600"
          >
            Submit
          </button>
        </form>

        {/* Back to home link */}
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
