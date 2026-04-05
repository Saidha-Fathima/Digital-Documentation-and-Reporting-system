import React, { useEffect, useState } from 'react';
import { getSpareParts, createSparePart, updateSparePart, deleteSparePart, reportSparePartUsage } from '../spareparts';
import type { SparePart } from '../types';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaPlus, FaMinusCircle } from 'react-icons/fa';

const SpareParts: React.FC = () => {
  const { user } = useAuth();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showUsageForm, setShowUsageForm] = useState(false);
  const [editing, setEditing] = useState<SparePart | null>(null);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  
  const [formData, setFormData] = useState<Partial<SparePart>>({
    part_name: '',
    quantity: 0,
    minimum_level: 5,
  });
  
  const [usageData, setUsageData] = useState({ quantity_used: 1 });

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    const data = await getSpareParts();
    setParts(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'part_name' ? value : parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateSparePart(editing.id, formData as SparePart);
    } else {
      await createSparePart(formData as Omit<SparePart, 'id'>);
    }
    setShowForm(false);
    setEditing(null);
    setFormData({ part_name: '', quantity: 0, minimum_level: 5 });
    fetchParts();
  };

  const handleEdit = (part: SparePart) => {
    setEditing(part);
    setFormData(part);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this spare part?')) {
      await deleteSparePart(id);
      fetchParts();
    }
  };

  const handleReportUsageClick = (part: SparePart) => {
    setSelectedPart(part);
    setUsageData({ quantity_used: 1 });
    setShowUsageForm(true);
  };

  const handleUsageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPart) {
      if (usageData.quantity_used > selectedPart.quantity) {
        alert("Cannot use more than available in stock.");
        return;
      }
      try {
        await reportSparePartUsage(selectedPart.id, usageData.quantity_used);
        setShowUsageForm(false);
        setSelectedPart(null);
        fetchParts();
      } catch (err) {
        alert("Failed to report usage.");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Spare Parts</h1>
        {user?.role === 'manager' && (
          <button onClick={() => setShowForm(true)} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 flex items-center">
            <FaPlus className="mr-2" />
              Add Spare Part
            </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Spare Part' : 'Add Spare Part'}</h2>
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
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Minimum Level</label>
                <input
                  type="number"
                  name="minimum_level"
                  value={formData.minimum_level}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditing(null); }}
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

      {showUsageForm && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Report Usage: {selectedPart.part_name}</h2>
            <p className="mb-4 text-sm text-gray-600">Available Stock: {selectedPart.quantity}</p>
            <form onSubmit={handleUsageSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Quantity to Use</label>
                <input
                  type="number"
                  name="quantity_used"
                  min="1"
                  max={selectedPart.quantity}
                  value={usageData.quantity_used}
                  onChange={(e) => setUsageData({ quantity_used: parseInt(e.target.value) || 1 })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowUsageForm(false); setSelectedPart(null); }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">
                  Submit Usage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Part Name</th>
              <th className="px-4 py-2 text-left">Quantity</th>
              <th className="px-4 py-2 text-left">Min Level</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parts.map(part => {
              const lowStock = part.quantity <= part.minimum_level;
              return (
                <tr key={part.id} className="border-t">
                  <td className="px-4 py-2">{part.part_name}</td>
                  <td className="px-4 py-2">{part.quantity}</td>
                  <td className="px-4 py-2">{part.minimum_level}</td>
                  <td className="px-4 py-2">
                    {lowStock ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium pulse">Low Stock</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">Available</span>
                    )}
                  </td>
                  <td className="px-4 py-2 flex space-x-3 items-center">
                    <button 
                      onClick={() => handleReportUsageClick(part)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center bg-primary-50 px-2 py-1 rounded"
                    >
                      <FaMinusCircle className="mr-1" /> Use
                    </button>

                    {user?.role === 'manager' && (
                      <>
                        <button onClick={() => handleEdit(part)} className="text-blue-600 hover:text-blue-800 transition-colors">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(part.id)} className="text-red-600 hover:text-red-800 transition-colors">
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpareParts;