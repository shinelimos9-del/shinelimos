import { useState, useEffect, useRef } from "react";
import { Plus, X, Trash2, Loader2, Upload } from "lucide-react";
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from "../../utils/api";

interface VehiclePrice {
  base_price: string;
  price_per_minute: string;
  price_per_mile: string;
  price_per_hour: string;
}

interface Vehicle {
  _id: string;
  vehicle_name: string;
  price: VehiclePrice;
  unites: string;
  passenger_capacity: string;
  luggage_capacity: string;
  image: string;
}

export default function AdminVehicles() {
  const [modalOpen, setModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    vehicle_name: "",
    base_price: "",
    price_per_minute: "",
    price_per_mile: "",
    price_per_hour: "",
    unites: "per hour",
    passenger_capacity: "",
    luggage_capacity: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await getVehicles();
      if (response.success) {
        setVehicles(response.vehicles);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        vehicle_name: vehicle.vehicle_name,
        base_price: vehicle.price.base_price,
        price_per_minute: vehicle.price.price_per_minute,
        price_per_mile: vehicle.price.price_per_mile,
        price_per_hour: vehicle.price.price_per_hour,
        unites: vehicle.unites,
        passenger_capacity: vehicle.passenger_capacity,
        luggage_capacity: vehicle.luggage_capacity,
      });
      setImagePreview(vehicle.image.startsWith('http') ? vehicle.image : `http://localhost:60000${vehicle.image}`);
    } else {
      setEditingVehicle(null);
      setFormData({
        vehicle_name: "",
        base_price: "",
        price_per_minute: "",
        price_per_mile: "",
        price_per_hour: "",
        unites: "per hour",
        passenger_capacity: "",
        luggage_capacity: "",
      });
      setImagePreview(null);
    }
    setSelectedFile(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingVehicle(null);
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const response = await deleteVehicle(id);
        if (response.success) {
          setVehicles(vehicles.filter((v) => v._id !== id));
        }
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete vehicle");
      }
    }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("vehicle_name", formData.vehicle_name);
      data.append("unites", formData.unites);
      data.append("passenger_capacity", formData.passenger_capacity);
      data.append("luggage_capacity", formData.luggage_capacity);
      
      const price = {
        base_price: formData.base_price,
        price_per_minute: formData.price_per_minute,
        price_per_mile: formData.price_per_mile,
        price_per_hour: formData.price_per_hour,
      };
      data.append("price", JSON.stringify(price));

      if (selectedFile) {
        data.append("image", selectedFile);
      }

      let response;
      if (editingVehicle) {
        response = await updateVehicle(data, editingVehicle._id);
      } else {
        if (!selectedFile) {
          alert("Please select an image for the new vehicle");
          setSubmitting(false);
          return;
        }
        response = await addVehicle(data);
      }

      if (response.success) {
        handleCloseModal();
        fetchVehicles();
      } else {
        alert(response.message || "Failed to save vehicle");
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
      alert("An error occurred while saving the vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif-lux text-white">Our Vehicles</h1>
          <p className="text-white text-sm mt-1">Manage fleet and pricing.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-white hover:bg-white/90 text-black px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/50">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Loading vehicles...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 text-white/50 bg-white/5 rounded-3xl border border-white/10">
          <p>No vehicles found. Click "Add Vehicle" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((v) => (
            <div key={v._id} className="glass-dark rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all hover:scale-[1.02] group flex flex-col relative">
              <div className="bg-white rounded-xl aspect-4/3 flex items-center justify-center p-4 mb-4 overflow-hidden relative group/img">
                 <img 
                   src={v.image.startsWith('http') ? v.image : `http://localhost:60000${v.image}`} 
                   alt={v.vehicle_name} 
                   className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                 />
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     handleDeleteVehicle(v._id);
                   }}
                   className="absolute top-2 right-2 bg-white/10 hover:bg-white text-white hover:text-red-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>
              <div className="text-center flex-1 flex flex-col">
                <h3 className="text-white font-medium text-sm mb-2 leading-tight">{v.vehicle_name}</h3>
                <div className="inline-block mx-auto px-4 py-1 rounded-full bg-white/10 text-xs text-white mb-4">
                  {v.unites} ${v.price?.base_price || 0}
                </div>
                <div className="mt-auto pt-2">
                  <button 
                    onClick={() => handleOpenModal(v)}
                    className="w-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white/20 transition-colors py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  >
                     Update Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#111]/90 backdrop-blur-md z-10">
              <h2 className="text-xl font-serif-lux text-white">{editingVehicle ? "Update Vehicle" : "Add New Vehicle"}</h2>
              <button onClick={handleCloseModal} className="text-white hover:text-white bg-white/5 rounded-full p-2">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveVehicle}>
              <div className="p-6 space-y-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl bg-white/5 border-2 border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group hover:border-white/20"
                >
                  {imagePreview ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="text-white" size={24} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                        <Upload className="text-white/40 group-hover:text-white/60" size={20} />
                      </div>
                      <div className="text-white/60 font-medium mb-1">Click to upload vehicle image</div>
                      <p className="text-white/30 text-xs">PNG, JPG or WEBP (max. 2MB)</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">Vehicle Name</label>
                    <input 
                      type="text" 
                      name="vehicle_name"
                      value={formData.vehicle_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Executive Luxury Sedan" 
                      required
                      className="w-full bg-black border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm focus:border-white/20 focus:outline-none transition-colors placeholder:text-white/20" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">Base Price ($)</label>
                    <input 
                      type="number" 
                      name="base_price"
                      value={formData.base_price}
                      onChange={handleInputChange}
                      placeholder="0.00" 
                      required
                      className="w-full bg-black border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm focus:border-white/20 focus:outline-none transition-colors placeholder:text-white/20" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">Price Per Min ($)</label>
                    <input 
                      type="number" 
                      name="price_per_minute"
                      value={formData.price_per_minute}
                      onChange={handleInputChange}
                      placeholder="0.00" 
                      required
                      className="w-full bg-black border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm focus:border-white/20 focus:outline-none transition-colors placeholder:text-white/20" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">Price Per Mile ($)</label>
                    <input 
                      type="number" 
                      name="price_per_mile"
                      value={formData.price_per_mile}
                      onChange={handleInputChange}
                      placeholder="0.00" 
                      required
                      className="w-full bg-black border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm focus:border-white/20 focus:outline-none transition-colors placeholder:text-white/20" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">Price Per Hour ($)</label>
                    <input 
                      type="number" 
                      name="price_per_hour"
                      value={formData.price_per_hour}
                      onChange={handleInputChange}
                      placeholder="0.00" 
                      required
                      className="w-full bg-black border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm focus:border-white/20 focus:outline-none transition-colors placeholder:text-white/20" 
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">Units</label>
                    <select 
                      name="unites"
                      value={formData.unites}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm focus:border-white/20 focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="per hour">Per Hour</option>
                      <option value="per day">Per Day</option>
                      <option value="flat rate">Flat Rate</option>
                    </select>
                    <div className="absolute right-4 bottom-3.5 pointer-events-none text-white/40">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">Passenger Capacity</label>
                    <input 
                      type="number" 
                      name="passenger_capacity"
                      value={formData.passenger_capacity}
                      onChange={handleInputChange}
                      placeholder="e.g. 4" 
                      required
                      className="w-full bg-black border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm focus:border-white/20 focus:outline-none transition-colors placeholder:text-white/20" 
                    />
                  </div>

                  <div className="md:col-span-2 relative">
                    <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">Luggage Capacity</label>
                    <input 
                      type="number" 
                      name="luggage_capacity"
                      value={formData.luggage_capacity}
                      onChange={handleInputChange}
                      placeholder="e.g. 2" 
                      required
                      className="w-full bg-black border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm focus:border-white/20 focus:outline-none transition-colors placeholder:text-white/20" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#111]/90 backdrop-blur-md">
                 <button 
                   type="button"
                   onClick={handleCloseModal} 
                   className="px-6 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={submitting}
                   className="bg-white hover:bg-white/90 disabled:bg-white/50 disabled:cursor-not-allowed text-black px-8 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                 >
                   {submitting && <Loader2 className="animate-spin" size={16} />}
                   {editingVehicle ? "Update Vehicle" : "Save Vehicle"}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
