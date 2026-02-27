import React, { useEffect, useState } from 'react';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../materials';
import type { Material } from '../types';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const Materials: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [formData, setFormData] = useState<Partial<Material>>({
    material_name: '',
    quantity: 0,
    minimum_level: 5,
  });

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Material</th>
              <th className="px-4 py-2 text-left">Quantity</th>
              <th className="px-4 py-2 text-left">Min Level</th>
              <th className="px-4 py-2 text-left">Status</th>
              {user?.role === 'manager' && <th className="px-4 py-2 text-left">Actions</th>}
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
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Low Stock</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">OK</span>
                    )}
                  </td>
                  {user?.role === 'manager' && (
                    <td className="px-4 py-2">
                      <button onClick={() => handleEdit(mat)} className="text-blue-600 hover:text-blue-800 transition-colors mr-3">
                        <FaEdit />
                      </button>

                      <button onClick={() => handleDelete(mat.id)} className="text-red-600 hover:text-red-800 transition-colors">
                        <FaTrash />
                      </button>
                    </td>
                  )}
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