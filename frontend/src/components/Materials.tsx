import React, { useEffect, useState } from 'react';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial, reportMaterialUsage } from '../materials';
import type { Material } from '../types';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaPlus, FaMinusCircle } from 'react-icons/fa';

const Materials: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showUsageForm, setShowUsageForm] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  
  const [formData, setFormData] = useState<Partial<Material>>({
    material_name: '',
    quantity: 0,
    minimum_level: 5,
  });
  
  const [usageData, setUsageData] = useState({ quantity_used: 1 });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const data = await getMaterials();
    setMaterials(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'material_name' ? value : parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateMaterial(editing.id, formData as Material);
    } else {
      await createMaterial(formData as Omit<Material, 'id'>);
    }
    setShowForm(false);
    setEditing(null);
    setFormData({ material_name: '', quantity: 0, minimum_level: 5 });
    fetchMaterials();
  };

  const handleEdit = (mat: Material) => {
    setEditing(mat);
    setFormData(mat);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this material?')) {
      await deleteMaterial(id);
      fetchMaterials();
    }
  };

  const handleReportUsageClick = (mat: Material) => {
    setSelectedMaterial(mat);
    setUsageData({ quantity_used: 1 });
    setShowUsageForm(true);
  };

  const handleUsageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMaterial) {
      if (usageData.quantity_used > selectedMaterial.quantity) {
        alert("Cannot use more than available in stock.");
        return;
      }
      try {
        await reportMaterialUsage(selectedMaterial.id, usageData.quantity_used);
        setShowUsageForm(false);
        setSelectedMaterial(null);
        fetchMaterials();
      } catch (err) {
        alert("Failed to report usage.");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Materials</h1>
        {user?.role === 'manager' && (
          <button onClick={() => setShowForm(true)} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 flex items-center">
            <FaPlus className="mr-2" />
              Add Material
            </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Material' : 'Add Material'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Material Name</label>
                <input
                  type="text"
                  name="material_name"
                  value={formData.material_name}
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

      {showUsageForm && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Report Usage: {selectedMaterial.material_name}</h2>
            <p className="mb-4 text-sm text-gray-600">Available Stock: {selectedMaterial.quantity}</p>
            <form onSubmit={handleUsageSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Quantity to Use</label>
                <input
                  type="number"
                  name="quantity_used"
                  min="1"
                  max={selectedMaterial.quantity}
                  value={usageData.quantity_used}
                  onChange={(e) => setUsageData({ quantity_used: parseInt(e.target.value) || 1 })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowUsageForm(false); setSelectedMaterial(null); }}
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
              <th className="px-4 py-2 text-left">Material</th>
              <th className="px-4 py-2 text-left">Quantity</th>
              <th className="px-4 py-2 text-left">Min Level</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(mat => {
              const lowStock = mat.quantity <= mat.minimum_level;
              return (
                <tr key={mat.id} className="border-t">
                  <td className="px-4 py-2">{mat.material_name}</td>
                  <td className="px-4 py-2">{mat.quantity}</td>
                  <td className="px-4 py-2">{mat.minimum_level}</td>
                  <td className="px-4 py-2">
                    {lowStock ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium pulse">Low Stock</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">Available</span>
                    )}
                  </td>
                  <td className="px-4 py-2 flex space-x-3 items-center">
                    <button 
                      onClick={() => handleReportUsageClick(mat)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center bg-primary-50 px-2 py-1 rounded"
                    >
                      <FaMinusCircle className="mr-1" /> Use
                    </button>

                    {user?.role === 'manager' && (
                      <>
                        <button onClick={() => handleEdit(mat)} className="text-blue-600 hover:text-blue-800 transition-colors">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(mat.id)} className="text-red-600 hover:text-red-800 transition-colors">
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

export default Materials;