import { useState, useEffect } from 'react';
import StoreStatusChart from './StoreStatusChart';
import DiscountCreationChart from './DiscountCreationChart';

const MonthlyDiscountChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/analytics/monthly-trends');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          if (isMounted) setData(json.data);
        } else {
          throw new Error(json.error || 'Failed to fetch analytics data');
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        if (isMounted) setError(err.message || 'Error fetching analytics data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="mb-6">
      <StoreStatusChart data={data} loading={loading} error={error} />
      <DiscountCreationChart data={data} loading={loading} error={error} />
    </div>
  );
};

export default MonthlyDiscountChart;
