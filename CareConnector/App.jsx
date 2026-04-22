import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Activity, 
  Zap, 
  LayoutDashboard, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Star, 
  Mail, 
  Phone,
  Calendar,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

const FEEDBACK_OPTIONS = [
  { label: 'Worst', value: 1, bg: 'bg-red-100', color: 'text-red-700' },
  { label: 'Bad', value: 2, bg: 'bg-orange-100', color: 'text-orange-700' },
  { label: 'Average', value: 3, bg: 'bg-yellow-100', color: 'text-yellow-700' },
  { label: 'Good', value: 4, bg: 'bg-green-100', color: 'text-green-700' },
  { label: 'Excellent', value: 5, bg: 'bg-blue-100', color: 'text-blue-700' },
];

const INITIAL_VOLUNTEERS = [
  { id: 'v1', name: 'Sarah Chen', email: 'sarah.c@example.com', phone: '555-0101', skills: ['Medical', 'First Aid'], location: 'Downtown', availability: 'Weekends', reliabilityScore: 98, tasksCompleted: 12 },
  { id: 'v2', name: 'Marcus Miller', email: 'marcus.m@example.com', phone: '555-0102', skills: ['Logistics', 'Driving'], location: 'Northside', availability: 'Flexible', reliabilityScore: 92, tasksCompleted: 8 },
  { id: 'v3', name: 'Elena Rodriguez', email: 'elena.r@example.com', phone: '555-0103', skills: ['Tech', 'Communication'], location: 'Southside', availability: 'Evenings', reliabilityScore: 95, tasksCompleted: 15 },
];

const INITIAL_TASKS = [
  { id: 't1', title: 'Food Bank Distribution', description: 'Help organize and distribute food packages.', contactInfo: 'John (555-9000)', requiredSkills: ['Logistics'], location: 'Downtown', urgency: 'Medium', status: 'Open', assigned: [], requiredVolunteers: 2 },
  { id: 't2', title: 'Emergency Clinic Support', description: 'Assisting staff with patient intake.', contactInfo: 'Dr. Smith (555-8822)', requiredSkills: ['Medical'], location: 'Northside', urgency: 'High', status: 'In Progress', assigned: ['v1'], requiredVolunteers: 1 },
];

const HeartPulseIcon = () => (
  <div className="relative flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="w-10 h-10 mr-1 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M-10 50 L10 50 L15 35 L25 65 L35 50 L75 50 L80 30 L90 70 L100 50 L120 50" 
            stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      <path d="M50 88C50 88 12 65 12 35C12 15 38 10 50 28C62 10 88 15 88 35C88 65 50 88 50 88Z" 
            fill="#e11d48" />
      <path d="M30 35 Q35 45 45 35 M55 35 Q65 45 70 35 M25 55 Q35 65 45 55 M55 55 Q65 65 75 55 M40 75 Q50 82 60 75" 
            stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M50 28 C50 20 45 15 55 10 C65 5 75 15 60 18" 
            stroke="#16a34a" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [volunteers, setVolunteers] = useState(INITIAL_VOLUNTEERS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  
  // Feedback states
  const [feedbackTaskId, setFeedbackTaskId] = useState(null);
  const [thankYouTaskId, setThankYouTaskId] = useState(null);

  // Form states
  const [newProfile, setNewProfile] = useState({ name: '', email: '', phone: '', skills: '', location: 'Downtown', availability: 'Flexible' });
  const [newTask, setNewTask] = useState({ title: '', description: '', contactInfo: '', skills: '', location: 'Downtown', urgency: 'Medium', requiredVolunteers: 1 });
  const [newEmergency, setNewEmergency] = useState({ title: '', description: '', contactInfo: '', skills: '', location: 'Downtown', requiredVolunteers: 1 });

  const getVolunteerLoad = (volunteerId) => {
    return tasks.filter(t => t.status !== 'Completed' && t.assigned.includes(volunteerId)).length;
  };

  const calculateMatchScore = (volunteer, task) => {
    if (!task) return { totalScore: 0 };
    let score = 0;
    const skillMatch = task.requiredSkills.filter(skill => 
      volunteer.skills.some(vSkill => vSkill.toLowerCase().includes(skill.toLowerCase()))
    ).length;
    score += (skillMatch / Math.max(task.requiredSkills.length, 1)) * 60;
    if (volunteer.location === task.location) score += 20;
    score += (volunteer.reliabilityScore / 100) * 20;
    return { totalScore: Math.round(score) };
  };

  const handleAllocate = (taskId, volunteerId) => {
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskId) {
        if (t.assigned.includes(volunteerId) || getVolunteerLoad(volunteerId) >= 2) return t;
        const newAssigned = [...t.assigned, volunteerId];
        return { 
          ...t, 
          assigned: newAssigned,
          status: newAssigned.length >= t.requiredVolunteers ? 'In Progress' : 'Open'
        };
      }
      return t;
    }));
  };

  const submitFeedback = (taskId, rating) => {
    setFeedbackTaskId(null);
    setThankYouTaskId(taskId);
    
    setTimeout(() => {
      finalizeTask(taskId, rating);
      setThankYouTaskId(null);
    }, 2000);
  };

  const finalizeTask = (taskId, ratingValue) => {
    const taskToComplete = tasks.find(t => t.id === taskId);
    if (!taskToComplete) return;
    
    const assignedIds = taskToComplete.assigned;
    const boost = ratingValue >= 4 ? 2 : ratingValue === 3 ? 1 : -1;

    setVolunteers(prev => prev.map(v => 
      assignedIds.includes(v.id) 
        ? { ...v, tasksCompleted: v.tasksCompleted + 1, reliabilityScore: Math.max(0, Math.min(100, v.reliabilityScore + boost)) }
        : v
    ));
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Completed', feedbackRating: ratingValue } : t));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
  };

  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!newProfile.name.trim()) return;
    const newVol = {
      id: `v-${Math.random().toString(36).substr(2, 5)}`,
      ...newProfile,
      skills: newProfile.skills.split(',').map(s => s.trim()).filter(s => s),
      reliabilityScore: 100,
      tasksCompleted: 0
    };
    setVolunteers(prev => [...prev, newVol]);
    setNewProfile({ name: '', email: '', phone: '', skills: '', location: 'Downtown', availability: 'Flexible' });
    setActiveTab('volunteers');
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const nTask = {
      id: `t-${Math.random().toString(36).substr(2, 5)}`,
      ...newTask,
      requiredSkills: newTask.skills.split(',').map(s => s.trim()).filter(s => s),
      status: 'Open',
      requiredVolunteers: parseInt(newTask.requiredVolunteers) || 1,
      assigned: []
    };
    setTasks(prev => [...prev, nTask]);
    setNewTask({ title: '', description: '', contactInfo: '', skills: '', location: 'Downtown', urgency: 'Medium', requiredVolunteers: 1 });
    setActiveTab('tasks');
  };

  const handleCreateEmergency = (e) => {
    e.preventDefault();
    const reqSkills = newEmergency.skills.split(',').map(s => s.trim()).filter(s => s);
    const reqCount = parseInt(newEmergency.requiredVolunteers) || 1;
    
    // Auto-assign logic
    const available = volunteers.filter(v => getVolunteerLoad(v.id) < 2);
    const scored = available.map(v => ({
      id: v.id,
      score: calculateMatchScore(v, { requiredSkills: reqSkills, location: newEmergency.location }).totalScore
    })).sort((a, b) => b.score - a.score);

    const assignedIds = scored.slice(0, reqCount).map(v => v.id);

    const nEmergency = {
      id: `em-${Math.random().toString(36).substr(2, 5)}`,
      title: `[EMERGENCY] ${newEmergency.title}`,
      description: newEmergency.description || 'Emergency response required.',
      contactInfo: newEmergency.contactInfo,
      requiredSkills: reqSkills,
      location: newEmergency.location,
      urgency: 'High',
      status: assignedIds.length >= reqCount ? 'In Progress' : 'Open',
      requiredVolunteers: reqCount,
      assigned: assignedIds,
      isEmergency: true
    };

    setTasks(prev => [nEmergency, ...prev]);
    setNewEmergency({ title: '', description: '', contactInfo: '', skills: '', location: 'Downtown', requiredVolunteers: 1 });
  };

  const FeedbackView = ({ taskId }) => (
    <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-100 animate-in fade-in slide-in-from-top-2">
      <p className="text-sm font-bold text-rose-900 mb-3 flex items-center">
        <MessageSquare size={16} className="mr-2" /> How would you rate the outcome?
      </p>
      <div className="flex flex-wrap gap-2">
        {FEEDBACK_OPTIONS.map(opt => (
          <button 
            key={opt.label}
            onClick={() => submitFeedback(taskId, opt.value)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${opt.bg} ${opt.color} border-current hover:scale-105 active:scale-95`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const ThankYouView = () => (
    <div className="mt-4 p-6 bg-green-50 rounded-xl border border-green-200 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
        <ThumbsUp size={24} />
      </div>
      <p className="text-lg font-black text-green-800">Thank You!</p>
      <p className="text-sm text-green-600">Your feedback helps improve our community response.</p>
    </div>
  );

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Volunteers', val: volunteers.length, icon: Users, color: 'text-blue-600' },
        { label: 'Active Needs', val: tasks.filter(t => t.status !== 'Completed').length, icon: Briefcase, color: 'text-orange-600' },
        { label: 'Open Slots', val: tasks.reduce((acc, t) => acc + (t.status === 'Completed' ? 0 : t.requiredVolunteers - t.assigned.length), 0), icon: Activity, color: 'text-green-600' },
        { label: 'Emergency Ops', val: tasks.filter(t => t.isEmergency && t.status !== 'Completed').length, icon: Zap, color: 'text-rose-600' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className={`${stat.color} mb-3`}><stat.icon size={24} /></div>
          <p className="text-2xl font-black">{stat.val}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{stat.label}</p>
        </div>
      ))}
    </div>
  );

  const renderEmergency = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border-2 border-rose-50 shadow-sm h-fit">
        <h2 className="text-lg font-bold text-rose-600 mb-4 flex items-center"><Zap size={20} className="mr-2"/> Dispatch Rapid Response</h2>
        <form onSubmit={handleCreateEmergency} className="space-y-4">
          <input className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-rose-100 outline-none" placeholder="Emergency Title" value={newEmergency.title} onChange={e=>setNewEmergency({...newEmergency, title: e.target.value})} required/>
          <input className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-rose-100 outline-none" placeholder="Contact Point / On-site Lead" value={newEmergency.contactInfo} onChange={e=>setNewEmergency({...newEmergency, contactInfo: e.target.value})} required/>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Volunteers Needed</label>
              <input type="number" className="p-3 border rounded-xl" value={newEmergency.requiredVolunteers} onChange={e=>setNewEmergency({...newEmergency, requiredVolunteers: e.target.value})} />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Location</label>
              <select className="p-3 border rounded-xl" value={newEmergency.location} onChange={e=>setNewEmergency({...newEmergency, location: e.target.value})}>
                <option value="Downtown">Downtown</option><option value="Northside">Northside</option><option value="Southside">Southside</option>
              </select>
            </div>
          </div>
          <input className="w-full p-3 border rounded-xl" placeholder="Required Skills (e.g. Medical, First Aid)" value={newEmergency.skills} onChange={e=>setNewEmergency({...newEmergency, skills: e.target.value})} />
          <button className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition transform active:scale-95">AUTO-ASSIGN & LAUNCH</button>
        </form>
      </div>
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-4 bg-rose-50 border-b border-rose-100 font-bold text-rose-700 flex items-center justify-between">
            <span>Live Critical Operations</span>
            <span className="text-[10px] px-2 py-1 bg-white rounded-full border border-rose-200">REAL-TIME</span>
          </div>
          <div className="divide-y">
            {tasks.filter(t => t.isEmergency && t.status !== 'Completed').length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic">No active emergency operations.</div>
            ) : (
              tasks.filter(t => t.isEmergency && t.status !== 'Completed').map(t => (
                <div key={t.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.assigned.length}/{t.requiredVolunteers} Responders Dispatched</p>
                    </div>
                    {feedbackTaskId !== t.id && thankYouTaskId !== t.id && (
                      <button 
                        onClick={() => setFeedbackTaskId(t.id)} 
                        className="flex items-center space-x-2 px-4 py-2 text-green-600 bg-green-50 rounded-xl font-bold hover:bg-green-100"
                      >
                        <CheckCircle2 size={18}/> <span>Finish</span>
                      </button>
                    )}
                  </div>
                  {feedbackTaskId === t.id && <FeedbackView taskId={t.id} />}
                  {thankYouTaskId === t.id && <ThankYouView />}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAllocation = () => {
    const currentTask = tasks.find(t => t.id === selectedTaskId);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="font-black text-gray-400 text-xs uppercase mb-4">Step 1: Select Open Task</h2>
          {tasks.filter(t => t.status === 'Open').length === 0 ? (
            <div className="p-10 border-2 border-dashed rounded-2xl text-center text-gray-400">No open needs awaiting allocation.</div>
          ) : (
            tasks.filter(t => t.status === 'Open').map(task => (
              <div 
                key={task.id} 
                onClick={() => setSelectedTaskId(task.id)}
                className={`p-5 rounded-2xl cursor-pointer border-2 transition-all ${selectedTaskId === task.id ? 'border-rose-600 bg-rose-50/30' : 'border-white bg-white hover:border-gray-200'}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold">{task.title}</h3>
                  {task.isEmergency && <Zap size={14} className="text-rose-500" />}
                </div>
                <p className="text-xs text-gray-500 mt-1">{task.location} • Need: {task.requiredVolunteers - task.assigned.length} more</p>
              </div>
            ))
          )}
        </div>
        <div className="space-y-4">
          <h2 className="font-black text-gray-400 text-xs uppercase mb-4">Step 2: Match Responders</h2>
          {selectedTaskId ? (
            volunteers.map(v => {
              const score = calculateMatchScore(v, currentTask);
              const load = getVolunteerLoad(v.id);
              const isAssigned = currentTask.assigned.includes(v.id);
              return (
                <div key={`${selectedTaskId}-${v.id}`} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold">{v.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{v.skills.slice(0,2).join(', ')}</p>
                    <div className="flex items-center mt-2 text-[10px] font-black">
                      <span className={`${load >= 2 ? 'text-rose-500' : 'text-green-500'}`}>{load}/2 Active Tasks</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                       <span className="text-xl font-black text-rose-600">{score.totalScore}%</span>
                       <p className="text-[9px] font-bold text-gray-400">MATCH</p>
                    </div>
                    <button 
                      disabled={load >= 2 || isAssigned}
                      onClick={() => handleAllocate(selectedTaskId, v.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${isAssigned ? 'bg-gray-100 text-gray-400' : load >= 2 ? 'bg-rose-50 text-rose-300' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
                    >
                      {isAssigned ? 'Assigned' : load >= 2 ? 'Max Capacity' : 'Allocate'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : <div className="p-10 border-2 border-dashed rounded-2xl text-center text-gray-400">Select a task on the left to start matching</div>}
        </div>
      </div>
    );
  };

  const renderVolunteers = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="font-bold mb-4">Register New Volunteer</h2>
        <form onSubmit={handleCreateProfile} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input className="p-3 border rounded-xl" placeholder="Full Name" value={newProfile.name} onChange={e=>setNewProfile({...newProfile, name: e.target.value})} required/>
          <input className="p-3 border rounded-xl" placeholder="Email Address" value={newProfile.email} onChange={e=>setNewProfile({...newProfile, email: e.target.value})} required/>
          <input className="p-3 border rounded-xl" placeholder="Mobile Number" value={newProfile.phone} onChange={e=>setNewProfile({...newProfile, phone: e.target.value})} required/>
          <input className="p-3 border rounded-xl lg:col-span-2" placeholder="Skills (e.g. Medical, Tech, Logistics)" value={newProfile.skills} onChange={e=>setNewProfile({...newProfile, skills: e.target.value})} required/>
          <select className="p-3 border rounded-xl" value={newProfile.location} onChange={e=>setNewProfile({...newProfile, location: e.target.value})}>
            <option value="Downtown">Downtown</option><option value="Northside">Northside</option><option value="Southside">Southside</option>
          </select>
          <button className="bg-rose-600 text-white rounded-xl font-bold py-3 hover:bg-rose-700 transition">Add Profile</button>
        </form>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {volunteers.map(v => (
          <div key={v.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start space-x-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 flex-shrink-0"><Users size={20}/></div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-gray-900 truncate">{v.name}</p>
              <div className="flex flex-col text-xs text-gray-500 mt-1 space-y-1">
                <span className="flex items-center"><Mail size={12} className="mr-1 flex-shrink-0"/> <span className="truncate">{v.email}</span></span>
                <span className="flex items-center"><Phone size={12} className="mr-1 flex-shrink-0"/> {v.phone}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {v.skills.map(s => <span key={s} className="bg-gray-50 text-[9px] px-2 py-0.5 rounded border font-medium">{s}</span>)}
              </div>
            </div>
            <div className="text-right">
               <div className="flex items-center text-rose-600">
                  <Star size={12} className="fill-current mr-0.5" />
                  <span className="text-xs font-black">{v.reliabilityScore}</span>
               </div>
               <p className="text-[9px] font-bold text-gray-400 uppercase">Score</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="font-bold mb-4">Register Community Need</h2>
        <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input className="p-3 border rounded-xl" placeholder="Task Title" value={newTask.title} onChange={e=>setNewTask({...newTask, title: e.target.value})} required/>
          <input className="p-3 border rounded-xl" placeholder="Coordinator Info" value={newTask.contactInfo} onChange={e=>setNewTask({...newTask, contactInfo: e.target.value})} required/>
          <input className="p-3 border rounded-xl md:col-span-2 lg:col-span-1" placeholder="Short Description" value={newTask.description} onChange={e=>setNewTask({...newTask, description: e.target.value})} required/>
          <input className="p-3 border rounded-xl" placeholder="Skills Needed" value={newTask.skills} onChange={e=>setNewTask({...newTask, skills: e.target.value})} required/>
          <div className="grid grid-cols-2 gap-2">
             <input type="number" min="1" className="p-3 border rounded-xl" value={newTask.requiredVolunteers} onChange={e=>setNewTask({...newTask, requiredVolunteers: e.target.value})} />
             <select className="p-3 border rounded-xl" value={newTask.location} onChange={e=>setNewTask({...newTask, location: e.target.value})}>
               <option value="Downtown">Downtown</option><option value="Northside">Northside</option><option value="Southside">Southside</option>
             </select>
          </div>
          <button className="bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition">Register Need</button>
        </form>
      </div>
      <div className="space-y-4">
        {tasks.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {t.isEmergency && <Zap size={14} className="text-rose-600" />}
                  <h3 className="font-bold text-gray-800">{t.title}</h3>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${t.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{t.status}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">POC: {t.contactInfo}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {t.status !== 'Completed' && feedbackTaskId !== t.id && thankYouTaskId !== t.id && (
                  <button onClick={() => setFeedbackTaskId(t.id)} className="px-6 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition transform active:scale-95">Finish Task</button>
                )}
                <button onClick={() => deleteTask(t.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"><Trash2 size={18}/></button>
              </div>
            </div>
            {feedbackTaskId === t.id && <FeedbackView taskId={t.id} />}
            {thankYouTaskId === t.id && <ThankYouView />}
            {t.status === 'Completed' && t.feedbackRating && (
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center text-xs font-bold text-gray-400">
                <CheckCircle2 size={14} className="mr-2 text-green-500" /> 
                Feedback received: <span className="ml-1 text-rose-600 uppercase">{FEEDBACK_OPTIONS.find(o => o.value === t.feedbackRating)?.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center">
            <HeartPulseIcon />
            <h1 className="text-4xl font-black text-rose-600 tracking-tighter">CC</h1>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-[0.2em] font-black ml-1">CareConnector</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'emergency', icon: Zap, label: 'Emergency Response' },
            { id: 'allocation', icon: Activity, label: 'Smart Allocation' },
            { id: 'volunteers', icon: Users, label: 'Volunteer Hub' },
            { id: 'tasks', icon: Briefcase, label: 'Tasks & Needs' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? (item.id === 'emergency' 
                      ? 'bg-red-700 text-white shadow-lg shadow-red-200' 
                      : 'bg-rose-600 text-white shadow-lg shadow-rose-100') 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <item.icon size={18} /> <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
           <div>
              <h1 className="text-3xl font-black text-gray-900 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h1>
              <p className="text-gray-400 text-sm font-medium italic">Empowering community response through CC</p>
           </div>
           <div className="flex items-center space-x-2 text-xs font-black text-rose-600 uppercase tracking-widest bg-white px-4 py-2 rounded-full border shadow-sm">
             <Calendar size={14} /> <span>April 2026</span>
           </div>
        </header>

        <div className="max-w-6xl">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'emergency' && renderEmergency()}
          {activeTab === 'allocation' && renderAllocation()}
          {activeTab === 'volunteers' && renderVolunteers()}
          {activeTab === 'tasks' && renderTasks()}
        </div>
      </main>
    </div>
  );
}