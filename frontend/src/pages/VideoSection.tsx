import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, ThumbsUp, X, Check, Clock } from 'lucide-react';

export const VideoSection: React.FC = () => {
  const { t } = useTranslation();
  const { activeRole, user } = useAuth();
  
  // Data States
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeSort, setActiveSort] = useState<'recent' | 'liked'>('recent');

  // Submit Modal
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'Education'
  });

  const fetchVideos = async () => {
    setLoading(true);
    try {
      // Pass the active role to retrieve pending files if ADMIN
      const data = await api.videos.getVideos(activeRole || '');
      setVideos(data);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [activeRole]);

  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url || !formData.category) {
      alert('Title, URL, and category are required');
      return;
    }
    setSubmitting(true);

    try {
      await api.videos.submitVideo({
        ...formData,
        submittedBy: user?.name || 'Anonymous'
      });
      setIsSubmitOpen(false);
      
      // Reset
      setFormData({
        title: '',
        url: '',
        description: '',
        category: 'Education'
      });
      
      await fetchVideos();
      alert('Video submitted successfully! It is now pending admin review.');
    } catch (err: any) {
      alert(`Error submitting video: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      const updated = await api.videos.likeVideo(id);
      // Update local state directly to avoid full reload
      setVideos(prev =>
        prev.map(v => (v.id === id ? { ...v, likes: updated.likes } : v))
      );
    } catch (err) {
      console.error('Failed to like video:', err);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.videos.approveVideo(id, status);
      await fetchVideos();
      alert(`Video status updated to: ${status}`);
    } catch (err: any) {
      alert(`Failed to update video status: ${err.message}`);
    }
  };

  // Categories list
  const categories = [
    'Education',
    'Creative Arts',
    'School Events',
    'Kannada Culture',
    'Science Projects',
    'Announcements'
  ];

  // Separate approved and pending videos
  const approvedVideos = videos.filter(v => v.status === 'APPROVED');
  const pendingVideos = videos.filter(v => v.status === 'PENDING');

  // Filter approved videos by category
  let filteredVideos = approvedVideos.filter(v => {
    if (categoryFilter === 'All') return true;
    return v.category === categoryFilter;
  });

  // Sort approved videos
  if (activeSort === 'liked') {
    filteredVideos.sort((a, b) => b.likes - a.likes);
  } else {
    // Default recent
    filteredVideos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <div className="flex-1 space-y-6 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t('videoSection')}</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 m-0">ವಿಡಿಯೋ ವಿಭಾಗ | Video Section</h2>
        </div>
        <button
          onClick={() => setIsSubmitOpen(true)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-md font-semibold text-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t('submitVideo')}</span>
        </button>
      </div>

      {/* ADMIN REVIEW QUEUE PANEL (Renders only if activeRole === 'ADMIN') */}
      {activeRole === 'ADMIN' && pendingVideos.length > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 animate-spin" style={{ animationDuration: '3s' }} />
            {t('pendingReview')} Queue ({pendingVideos.length})
          </h3>
          
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 text-[10px] uppercase font-bold text-gray-400">
                    <th className="py-3 px-6">Title</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Submitted By</th>
                    <th className="py-3 px-6">YouTube URL</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                  {pendingVideos.map(vid => (
                    <tr key={vid.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <td className="py-3 px-6 font-bold text-gray-900 dark:text-white">{vid.title}</td>
                      <td className="py-3 px-6">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px]">
                          {vid.category}
                        </span>
                      </td>
                      <td className="py-3 px-6">{vid.submittedBy}</td>
                      <td className="py-3 px-6 truncate max-w-xs">{vid.url}</td>
                      <td className="py-3 px-6 text-center space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(vid.id, 'APPROVED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] inline-flex items-center cursor-pointer"
                        >
                          <Check className="h-3 w-3 mr-1" /> {t('approve')}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(vid.id, 'REJECTED')}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px] inline-flex items-center cursor-pointer"
                        >
                          <X className="h-3 w-3 mr-1" /> {t('reject')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Navigation filter / tabs toolbar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Category select */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs font-semibold px-3 py-2 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
          >
            <option value="All">{t('all')}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sort Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-950 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveSort('recent')}
            className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSort === 'recent'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Recently Added
          </button>
          <button
            onClick={() => setActiveSort('liked')}
            className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSort === 'liked'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Most Liked
          </button>
        </div>

      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl text-gray-400">
          No approved videos found in this category. Submit a link above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(video => (
            <div
              key={video.id}
              className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col glow-card"
            >
              
              {/* YouTube Embed Iframe */}
              <div className="aspect-video w-full bg-gray-100 dark:bg-gray-950">
                <iframe
                  src={video.url}
                  title={video.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Body Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 text-[9px] font-bold">
                      {video.category}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-snug line-clamp-2">
                    {video.title}
                  </h4>
                  {video.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </div>

                {/* Footer and Liking triggers */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-gray-800/80">
                  <div className="text-[10px] text-gray-400 font-medium">
                    By <strong className="text-gray-600 dark:text-gray-300">{video.submittedBy}</strong>
                  </div>
                  <button
                    onClick={() => handleLike(video.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl border border-gray-200/60 dark:border-gray-800/60 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{video.likes}</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* SUBMIT VIDEO LINK MODAL */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">{t('submitVideo')}</h3>
              <button onClick={() => setIsSubmitOpen(false)} className="text-emerald-100 hover:text-white rounded-lg transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitVideo} className="p-6 space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {t('videoTitle')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Kannada Alphabet Learning"
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {t('youtubeUrl')}
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {t('videoCategory')}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {t('description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Briefly describe what this video covers..."
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Video'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
