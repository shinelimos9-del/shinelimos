import { useState, useEffect } from "react";
import { Plus, X, Trash2, Loader2, Edit2, User } from "lucide-react";
import { getDrivers, addDriver, updateDriver, deleteDriver } from "../../utils/api";

// Phase 1: admin-managed drivers, assigned from the booking detail view.
// Phase 2: the admin also sets each driver's portal password here. The
// driver then logs in at /driver-login with their email + this password
// to see only their assigned trips (never any price). A blank password
// on edit keeps the existing password; has_login shows whether a
// password has ever been set for that driver.
interface Driver {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  license_number: string;
  license_expiry?: string;
  status: "active" | "inactive";
  notes?: string;
  photo?: string;
  has_login?: boolean;
}

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  license_number: "",
  license_expiry: "",
  status: "active" as "active" | "inactive",
  notes: "",
  photo: "",
  password: "",
};

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await getDrivers();
      if (response.success) {
        setDrivers(response.drivers || []);
      } else {
        setError(response.message || "Failed to load drivers");
      }
    } catch (e) {
      setError("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingDriver(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name || "",
      phone: driver.phone || "",
      email: driver.email || "",
      license_number: driver.license_number || "",
      license_expiry: driver.license_expiry ? driver.license_expiry.slice(0, 10) : "",
      status: driver.status || "active",
      notes: driver.notes || "",
      photo: driver.photo || "",
      password: "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.license_number.trim()) {
      setError("Name, phone and license number are required.");
      return;
    }
    try {
      setSubmitting(true);
      // Blank password on edit = keep the existing password. On add, a
      // blank password means the driver cannot log in yet.
      const payload = { ...formData, license_expiry: formData.license_expiry || undefined, password: formData.password.trim() ? formData.password : undefined };
      const response = editingDriver
        ? await updateDriver(editingDriver._id, payload)
        : await addDriver(payload);
      if (response.success) {
        setModalOpen(false);
        fetchDrivers();
      } else {
        setError(response.message || "Failed to save driver");
      }
    } catch (err) {
      setError("Failed to save driver");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete driver ${name}? Their name stays on past bookings, but they can no longer be assigned.`)) return;
    try {
      const response = await deleteDriver(id);
      if (response.success) fetchDrivers();
      else setError(response.message || "Failed to delete driver");
    } catch (err) {
      setError("Failed to delete driver");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white">
        <Loader2 className="animate-spin mr-2" /> Loading drivers...
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Drivers</h1>
          <p className="text-sm text-white/60">Register chauffeurs here, then assign them to bookings from the booking detail view.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gold text-black px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90"
        >
          <Plus size={16} /> Add Driver
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {drivers.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-white/60">
          No drivers registered yet. Add your first driver to start assigning trips.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {drivers.map((driver) => (
            <div key={driver._id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {driver.photo ? (
                    <img src={driver.photo} alt={driver.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                      <User className="text-gold" size={20} />
                    </div>
                  )}
                  <div>
                    <div className="text-white font-medium">{driver.name}</div>
                    <div className="text-xs text-white/60">{driver.phone}{driver.email ? ` · ${driver.email}` : ""}</div>
                  </div>
                </div>
                <span className={`text-[11px] px-2 py-1 rounded-full border ${driver.status === "active" ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-white/5 border-white/10 text-white/60"}`}>
                  {driver.status}
                </span>
                <span className={`text-[11px] px-2 py-1 rounded-full border ${driver.has_login ? "bg-gold/10 border-gold/30 text-gold" : "bg-white/5 border-white/10 text-white/60"}`}>
                  {driver.has_login ? "Login ready" : "No login password"}
                </span>
              </div>
              <div className="mt-4 text-sm text-white/70 space-y-1">
                <div>License: {driver.license_number}</div>
                {driver.license_expiry && <div>License expiry: {driver.license_expiry.slice(0, 10)}</div>}
                {driver.notes && <div className="text-white/50">{driver.notes}</div>}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(driver)} className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(driver._id, driver.name)} className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-300 px-3 py-2 rounded-lg">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">{editingDriver ? "Edit Driver" : "Add Driver"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-white/60 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Full name *</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Phone *</label>
                  <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white" required />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">License number *</label>
                  <input value={formData.license_number} onChange={(e) => setFormData({ ...formData, license_number: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white" required />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">License expiry</label>
                  <input type="date" value={formData.license_expiry} onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Driver portal password {editingDriver ? "(leave blank to keep existing)" : "(required for driver login)"}</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} autoComplete="new-password" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white" />
                <p className="text-[11px] text-white/40 mt-1">The driver logs in at /driver-login with their email and this password. Share it with the driver privately — it is stored as a hash and cannot be shown again.</p>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Photo URL (optional)</label>
                <input value={formData.photo} onChange={(e) => setFormData({ ...formData, photo: e.target.value })} placeholder="https://…" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white" />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-gold text-black py-3 rounded-xl font-semibold disabled:opacity-50">
                {submitting ? "Saving..." : editingDriver ? "Save Changes" : "Add Driver"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
