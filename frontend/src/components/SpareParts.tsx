import React, { useEffect, useState } from 'react';
import { getSpareParts, addSparePartUsage, deleteSparePart, getMonthlySummary } from '../spareparts';
import type { SparePart, MonthlySummary } from '../types';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaPlus } from 'react-icons/fa';

const SpareParts: React.FC = () => {
  const { user } = useAuth();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [summary, setSummary] = useState<MonthlySummary[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ part_name: '', quantity_used: 1 });
  const [viewSummary, setViewSummary] = useState(false);

  useEffect(() => {
    fetchParts();
    if (user?.role === 'manager') {
      fetchSummary();
    }
  }, [user]);

  const fetchParts = async () => {
    const data = await getSpareParts();
    setParts(data);
  };

  const fetchSummary = async () => {
    const data = await getMonthlySummary();
    setSummary(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'part_name' ? value : parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSparePartUsage(formData);
    setShowForm(false);
    setFormData({ part_name: '', quantity_used: 1 });
    fetchParts();
    if (user?.role === 'manager') fetchSummary();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this usage record?')) {
      await deleteSparePart(id);
      fetchParts();
      if (user?.role === 'manager') fetchSummary();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Spare Parts Consumption</h1>
        {user?.role === 'manager' && (
          <button onClick={() => setShowForm(true)} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 flex items-center">
            <FaPlus className="mr-2" />
              Record Usage
          </button>
        )}
      </div>

      {user?.role === 'manager' && (
        <div className="mb-4">
          <button
            onClick={() => setViewSummary(!viewSummary)}
            className="text-primary-600 hover:underline"
          >
            {viewSummary ? 'Hide Monthly Summary' : 'View Monthly Summary'}
          </button>
        </div>
      )}

      {viewSummary && user?.role === 'manager' && (
        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Summary</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Month</th>
                <th className="text-left">Part Name</th>
                <th className="text-left">Total Used</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-2">{item.month}</td>
                  <td>{item.part_name}</td>
                  <td>{item.total_used}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Record Spare Part Usage</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Part Name</label>
                <input
                  type="text"
                  name="part_name"
                  value={formData.part_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Quantity Used</label>
                <input
                  type="number"
                  name="quantity_used"
                  min="1"
                  value={formData.quantity_used}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parts Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Part Name</th>
              <th className="px-4 py-2 text-left">Quantity Used</th>
              <th className="px-4 py-2 text-left">Used By</th>
              <th className="px-4 py-2 text-left">Date</th>
              {user?.role === 'manager' && <th className="px-4 py-2 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {parts.map(part => (
              <tr key={part.id} className="border-t">
                <td className="px-4 py-2">{part.part_name}</td>
                <td className="px-4 py-2">{part.quantity_used}</td>
                <td className="px-4 py-2">{part.used_by_name || part.used_by}</td>
                <td className="px-4 py-2">{new Date(part.used_date).toLocaleDateString()}</td>
                {user?.role === 'manager' && (
                  <td className="px-4 py-2">
                    <button onClick={() => handleDelete(part.id)} className="text-red-600 hover:text-red-800 transition-colors">
                      <FaTrash />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpareParts;