import React, { useEffect, useState } from 'react';
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Power, 
  AlertCircle,
  CheckCircle2,
  Lock,
  X
} from 'lucide-react';
import { DecoyAsset, AssetType, AssetStatus, RiskLevel } from '../types';
import { fetchAssets, createAsset, updateAsset, deleteAsset } from '../lib/api';

interface DecoyAssetManagerProps {
  onStartSimulationForAsset?: (assetId: string) => void;
  isOpenCreateModal?: boolean;
  onCloseCreateModal?: () => void;
}

export const DecoyAssetManager: React.FC<DecoyAssetManagerProps> = ({
  onStartSimulationForAsset,
  isOpenCreateModal = false,
  onCloseCreateModal,
}) => {
  const [assets, setAssets] = useState<DecoyAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(isOpenCreateModal);
  const [editingAsset, setEditingAsset] = useState<DecoyAsset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<DecoyAsset | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    type: AssetType;
    description: string;
    status: AssetStatus;
    risk_level: RiskLevel;
    endpoint_path: string;
  }>({
    name: '',
    type: 'login_endpoint',
    description: '',
    status: 'active',
    risk_level: 'medium',
    endpoint_path: '',
  });

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAssets();
      setAssets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch decoy assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    if (isOpenCreateModal) {
      setIsModalOpen(true);
    }
  }, [isOpenCreateModal]);

  const handleOpenCreate = () => {
    setEditingAsset(null);
    setFormData({
      name: '',
      type: 'login_endpoint',
      description: '',
      status: 'active',
      risk_level: 'medium',
      endpoint_path: '/auth/portal/internal-v2',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asset: DecoyAsset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      description: asset.description,
      status: asset.status,
      risk_level: asset.risk_level,
      endpoint_path: asset.endpoint_path,
    });
    setIsModalOpen(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, formData);
      } else {
        await createAsset(formData);
      }
      setIsModalOpen(false);
      if (onCloseCreateModal) onCloseCreateModal();
      await loadAssets();
    } catch (err: any) {
      alert(err.message || 'Error saving decoy asset');
    }
  };

  const handleToggleStatus = async (asset: DecoyAsset) => {
    try {
      const nextStatus: AssetStatus = asset.status === 'active' ? 'paused' : 'active';
      await updateAsset(asset.id, { status: nextStatus });
      await loadAssets();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle asset state');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAsset) return;
    try {
      await deleteAsset(deletingAsset.id);
      setDeletingAsset(null);
      await loadAssets();
    } catch (err: any) {
      alert(err.message || 'Failed to delete asset');
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.endpoint_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF873D]">Tripwire Configuration</span>
            <span className="text-xs text-[#CDD2D8]/40">·</span>
            <span className="text-xs text-[#D0BFB0]">Decoy Infrastructure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFF8F1] tracking-tight mt-1">Decoy Asset Manager</h1>
          <p className="text-xs sm:text-sm text-[#D0BFB0] mt-1">
            Deploy simulated honey-traps, mock API routes, and canary files to safely intercept adversary reconnaissance.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl glass-button-primary flex items-center gap-2 shrink-0 shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#15120F]" />
          <span>Deploy New Decoy</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#D0BFB0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search decoy name, path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#2B1B13]/60 border border-[rgba(255,170,100,0.25)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF873D] text-[#FFF8F1] placeholder-[#A3ABB3]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#D0BFB0]">
            <Filter className="w-3.5 h-3.5 text-[#FF873D]" />
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#2B1B13]/60 border border-[rgba(255,170,100,0.25)] rounded-lg focus:outline-none text-[#FFF8F1] focus:ring-1 focus:ring-[#FF873D]"
            >
              <option value="all" className="bg-[#15120F] text-[#FFF8F1]">All Asset Types</option>
              <option value="login_endpoint" className="bg-[#15120F] text-[#FFF8F1]">Fake Login Endpoint</option>
              <option value="admin_portal" className="bg-[#15120F] text-[#FFF8F1]">Simulated Admin Portal</option>
              <option value="config_secret" className="bg-[#15120F] text-[#FFF8F1]">Canary Secret Lure</option>
              <option value="api_mock" className="bg-[#15120F] text-[#FFF8F1]">Mock API Route</option>
              <option value="file_lure" className="bg-[#15120F] text-[#FFF8F1]">Decoy Document Lure</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#D0BFB0]">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#2B1B13]/60 border border-[rgba(255,170,100,0.25)] rounded-lg focus:outline-none text-[#FFF8F1] focus:ring-1 focus:ring-[#FF873D]"
            >
              <option value="all" className="bg-[#15120F] text-[#FFF8F1]">All Statuses</option>
              <option value="active" className="bg-[#15120F] text-[#FFF8F1]">Active</option>
              <option value="paused" className="bg-[#15120F] text-[#FFF8F1]">Paused</option>
              <option value="disabled" className="bg-[#15120F] text-[#FFF8F1]">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Asset Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-[#2B1B13]/40 border border-[rgba(255,170,100,0.15)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="p-12 rounded-2xl glass-panel text-center space-y-3">
          <Target className="w-10 h-10 text-[#FF873D]/40 mx-auto" />
          <h3 className="text-base font-semibold text-[#FFF8F1]">No decoy assets match your search</h3>
          <p className="text-xs text-[#D0BFB0] max-w-sm mx-auto">
            Try adjusting your search query or filters, or deploy a new decoy trap using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="p-5 rounded-2xl glass-panel glass-card-hover flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header row: Status and Risk Level */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        asset.status === 'active'
                          ? 'bg-[#FF873D] shadow-[0_0_8px_#FF873D]'
                          : asset.status === 'paused'
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#A3ABB3]'
                      }`}
                    />
                    <span className="font-semibold capitalize text-[#FFF8F1]">
                      {asset.status}
                    </span>
                  </div>

                  <span
                    className={`font-semibold capitalize text-[11px] px-2 py-0.5 rounded-full border ${
                      asset.risk_level === 'critical'
                        ? 'text-[#F43F5E] bg-[#F43F5E]/10 border-[#F43F5E]/30'
                        : asset.risk_level === 'high'
                        ? 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30'
                        : asset.risk_level === 'medium'
                        ? 'text-[#FF873D] bg-[#FF873D]/10 border-[#FF873D]/30'
                        : 'text-[#CDD2D8] bg-[#CDD2D8]/10 border-[#CDD2D8]/20'
                    }`}
                  >
                    Risk: {asset.risk_level}
                  </span>
                </div>

                {/* Asset Title and Type */}
                <div>
                  <h3 className="text-base font-bold text-[#FFF8F1] tracking-tight">{asset.name}</h3>
                  <div className="text-[11px] text-[#FFB45E] font-bold capitalize mt-0.5">
                    {asset.type.replace('_', ' ')}
                  </div>
                </div>

                <p className="text-xs text-[#D0BFB0] line-clamp-2 leading-relaxed">
                  {asset.description}
                </p>

                {/* Endpoint Path Box */}
                <div className="p-2.5 rounded-lg bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)] font-mono text-[11px] text-[#FFB45E] truncate">
                  {asset.endpoint_path}
                </div>
              </div>

              {/* Footer Meta & Actions */}
              <div className="pt-3 border-t border-[rgba(255,170,100,0.15)] flex items-center justify-between text-xs">
                <div className="text-[11px] text-[#D0BFB0] font-mono">
                  Events: <strong className="text-[#FFF8F1] font-bold">{asset.event_count}</strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleStatus(asset)}
                    className="p-1.5 text-[#D0BFB0] hover:text-[#FF873D] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    title={asset.status === 'active' ? 'Pause Decoy' : 'Activate Decoy'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(asset)}
                    className="p-1.5 text-[#D0BFB0] hover:text-[#FF873D] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    title="Edit Decoy"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingAsset(asset)}
                    className="p-1.5 text-[#F43F5E] hover:text-white rounded-lg hover:bg-[#F43F5E]/20 transition-colors cursor-pointer"
                    title="Delete Decoy"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#15120F]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl glass-panel bg-[#2B1B13]/95 p-6 space-y-5 shadow-[0_0_50px_rgba(255,135,61,0.15)] border border-[rgba(255,170,100,0.35)]">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,170,100,0.2)]">
              <h3 className="text-base font-bold text-[#FFF8F1]">
                {editingAsset ? 'Edit Decoy Asset Configuration' : 'Deploy Simulated Decoy Asset'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseCreateModal) onCloseCreateModal();
                }}
                className="text-[#D0BFB0] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#FFF8F1] mb-1">Decoy Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HoneySQL Database Console"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#15120F]/80 border border-[rgba(255,170,100,0.25)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF873D] text-[#FFF8F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#FFF8F1] mb-1">Asset Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AssetType })}
                    className="w-full px-3 py-2 bg-[#15120F]/80 border border-[rgba(255,170,100,0.25)] rounded-xl focus:outline-none text-[#FFF8F1] focus:ring-1 focus:ring-[#FF873D]"
                  >
                    <option value="login_endpoint" className="bg-[#15120F] text-[#FFF8F1]">Fake Login Endpoint</option>
                    <option value="admin_portal" className="bg-[#15120F] text-[#FFF8F1]">Simulated Admin Portal</option>
                    <option value="config_secret" className="bg-[#15120F] text-[#FFF8F1]">Canary Secret Lure</option>
                    <option value="api_mock" className="bg-[#15120F] text-[#FFF8F1]">Mock API Endpoint</option>
                    <option value="file_lure" className="bg-[#15120F] text-[#FFF8F1]">Decoy File / Document</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#FFF8F1] mb-1">Risk Classification</label>
                  <select
                    value={formData.risk_level}
                    onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as RiskLevel })}
                    className="w-full px-3 py-2 bg-[#15120F]/80 border border-[rgba(255,170,100,0.25)] rounded-xl focus:outline-none text-[#FFF8F1] focus:ring-1 focus:ring-[#FF873D]"
                  >
                    <option value="low" className="bg-[#15120F] text-[#FFF8F1]">Low Risk</option>
                    <option value="medium" className="bg-[#15120F] text-[#FFF8F1]">Medium Risk</option>
                    <option value="high" className="bg-[#15120F] text-[#FFF8F1]">High Risk</option>
                    <option value="critical" className="bg-[#15120F] text-[#FFF8F1]">Critical Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#FFF8F1] mb-1">Simulated Endpoint or File Path</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /admin/db-console or /.env.staging.secrets"
                  value={formData.endpoint_path}
                  onChange={(e) => setFormData({ ...formData, endpoint_path: e.target.value })}
                  className="w-full px-3 py-2 bg-[#15120F]/80 border border-[rgba(255,170,100,0.25)] rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-[#FF873D] text-[#FFB45E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#FFF8F1] mb-1">Tripwire Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain what this simulated decoy mimics and how attackers would stumble into it..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#15120F]/80 border border-[rgba(255,170,100,0.25)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF873D] text-[#FFF8F1]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FF873D]/10 border border-[#FF873D]/25 text-[11px] text-[#FFF8F1] flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-[#FF873D] shrink-0 mt-0.5" />
                <span>
                  Safe Deception Guarantee: Decoy assets are purely simulated application targets that capture unauthorized attempts without exposing real secrets or servers.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(255,170,100,0.2)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onCloseCreateModal) onCloseCreateModal();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#D0BFB0] hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg glass-button-primary shadow-sm cursor-pointer"
                >
                  {editingAsset ? 'Save Changes' : 'Deploy Decoy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAsset && (
        <div className="fixed inset-0 z-50 bg-[#15120F]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl glass-panel bg-[#2B1B13] p-6 space-y-4 shadow-2xl border border-[#F43F5E]/40">
            <div className="flex items-center gap-3 text-[#F43F5E]">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Delete Decoy Asset?</h3>
            </div>
            <p className="text-xs text-[#D0BFB0] leading-relaxed">
              Are you sure you want to remove <strong className="text-white">{deletingAsset.name}</strong>? Any associated events will remain in the historical cryptographic ledger, but the tripwire endpoint will be decommissioned.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeletingAsset(null)}
                className="px-4 py-2 text-xs font-semibold text-[#D0BFB0] hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#F43F5E] hover:bg-[#e11d48] rounded-lg shadow-lg cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
