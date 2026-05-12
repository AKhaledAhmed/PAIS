import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../Components/Loader/Loader';

const token = () => localStorage.getItem('accessToken');
const BASE = 'https://pais-production.up.railway.app/api/drugs';

const emptyForm = {
  name: '', category: '', dosageForm: '',
  composition: '', uses: '', sideEffects: '',
  contraindications: '', imageUrl: ''
};

export default function AdminDrugsPage() {
  const [drugs, setDrugs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // الدواء اللي هيتمسح
  const [editingDrug, setEditingDrug] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetchDrugs(); }, []);

  async function fetchDrugs() {
    try {
      const response = await axios.get(BASE, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setDrugs(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function openAdd() {
    setEditingDrug(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(drug) {
    setEditingDrug(drug);
    setForm({
      name: drug.name,
      category: drug.category,
      dosageForm: drug.dosageForm,
      composition: drug.composition?.join(', '),
      uses: drug.uses,
      sideEffects: drug.sideEffects || '',
      contraindications: drug.contraindications || '',
      imageUrl: drug.imageUrl || ''
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        composition: form.composition.split(',').map(s => s.trim())
      };
      if (editingDrug) {
        await axios.put(`${BASE}/${editingDrug._id}`, payload, {
          headers: { Authorization: `Bearer ${token()}` }
        });
      } else {
        await axios.post(BASE, payload, {
          headers: { Authorization: `Bearer ${token()}` }
        });
      }
      setShowModal(false);
      fetchDrugs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save drug');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await axios.delete(`${BASE}/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setDeleteTarget(null);
      fetchDrugs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete drug');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Drug Catalog</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-900 text-white rounded-xl text-sm font-semibold hover:bg-cyan-950 transition"
        >
          <Plus size={16}/> Add Drug
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400"><Loader/></div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Form</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Composition</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drugs.map((drug) => (
                <tr key={drug._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{drug.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{drug.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{drug.dosageForm}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{drug.composition?.join(', ')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(drug)}
                        className="flex items-center gap-1 text-xs font-semibold text-cyan-700 bg-cyan-50 px-2 py-1 rounded-lg hover:bg-cyan-100 transition"
                      >
                        <Edit2 size={12}/> Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(drug)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 size={12}/> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Drug</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action is irreversible.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:bg-red-300 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Deleting...
                  </>
                ) : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

     
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingDrug ? 'Edit Drug' : 'Add New Drug'}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">Name *</label>
                <input required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">Category *</label>
                <input required value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">Dosage Form *</label>
                <select required value={form.dosageForm}
                  onChange={(e) => setForm({ ...form, dosageForm: e.target.value })}
                  className="p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 text-sm">
                  <option value="">Select form</option>
                  <option>Tablet</option>
                  <option>Syrup</option>
                  <option>Injection</option>
                  <option>Capsule</option>
                  <option>Inhaler</option>
                  <option>Drops</option>
                  <option>Cream</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Composition * <span className="font-normal text-gray-400">(comma separated)</span>
                </label>
                <input required value={form.composition}
                  onChange={(e) => setForm({ ...form, composition: e.target.value })}
                  placeholder="Paracetamol 500mg, Caffeine 65mg"
                  className="p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1">Uses *</label>
                <textarea required rows={2} value={form.uses}
                  onChange={(e) => setForm({ ...form, uses: e.target.value })}
                  className="p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">Side Effects</label>
                <input value={form.sideEffects}
                  onChange={(e) => setForm({ ...form, sideEffects: e.target.value })}
                  className="p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">Contraindications</label>
                <input value={form.contraindications}
                  onChange={(e) => setForm({ ...form, contraindications: e.target.value })}
                  className="p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1">Image URL</label>
                <input value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>

              <div className="col-span-2 flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-cyan-900 text-white rounded-xl font-bold hover:bg-cyan-950 transition disabled:bg-gray-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      Saving...
                    </>
                  ) : editingDrug ? 'Update Drug' : 'Add Drug'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}