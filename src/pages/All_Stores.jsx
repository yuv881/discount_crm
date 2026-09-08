import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Main_Table from '../components/Main_Table';
import { TableSkeleton } from '../components/SkeletonLoader';
import { AlertCircle } from 'lucide-react';

const All_Stores = ({ onTotalCountChange }) => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalCount, setTotalCount] = useState(0);

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Read filter / pagination / sorting state from URL search parameters
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';
    const datePreset = searchParams.get('datePreset') || 'all';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const sortField = searchParams.get('sortField') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));

    // Helper to update specific search params in URL cleanly
    const updateParams = useCallback((updates) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            Object.entries(updates).forEach(([key, val]) => {
                if (val === undefined || val === null || val === '' || val === 'all' || (key === 'page' && val === 1)) {
                    next.delete(key);
                } else {
                    next.set(key, String(val));
                }
            });
            return next;
        });
    }, [setSearchParams]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadStores() {
            try {
                const params = new URLSearchParams({
                    search,
                    status: statusFilter,
                    startDate,
                    endDate,
                    sortField,
                    sortOrder,
                    page: String(page),
                    limit: String(limit),
                });

                const res = await fetch(`/api/stores?${params.toString()}`, {
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const json = await res.json();
                if (json.success) {
                    setDiscounts(json.data || []);
                    setTotalCount(json.totalCount || 0);
                    if (onTotalCountChange) {
                        onTotalCountChange(json.totalCount || 0);
                    }
                    setError('');
                } else {
                    throw new Error(json.error || 'Failed to fetch stores data');
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error fetching stores:', err);
                    setError(err.message || 'Error connecting to server');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadStores();

        return () => {
            controller.abort();
        };
    }, [search, statusFilter, startDate, endDate, sortField, sortOrder, page, limit, onTotalCountChange]);

    const handleDateFilterChange = (range) => {
        updateParams({
            datePreset: range.preset,
            startDate: range.startDate || '',
            endDate: range.endDate || '',
            page: 1,
        });
    };

    const handleRowClick = (storeDomain) => {
        if (storeDomain) {
            navigate(`/store/${encodeURIComponent(storeDomain)}`);
        }
    };

    return (
        <div className="py-6 px-4 md:px-8 bg-slate-50 min-h-[calc(100vh-64px)] w-full">
            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                        <span className="font-semibold">Connection Error: </span>
                        {error} - Ensure the backend service is running on port 3000.
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            {loading && discounts.length === 0 ? (
                <TableSkeleton />
            ) : (
                <Main_Table
                    discounts={discounts}
                    totalCount={totalCount}
                    page={page}
                    limit={limit}
                    search={search}
                    statusFilter={statusFilter}
                    datePreset={datePreset}
                    startDate={startDate}
                    endDate={endDate}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    loading={loading}
                    onSearchChange={(val) => {
                        updateParams({ search: val, page: 1 });
                    }}
                    onStatusFilterChange={(val) => {
                        updateParams({ status: val, page: 1 });
                    }}
                    onDateFilterChange={handleDateFilterChange}
                    onSortChange={(field, order) => {
                        updateParams({ sortField: field, sortOrder: order, page: 1 });
                    }}
                    onPageChange={(newPage) => {
                        updateParams({ page: newPage });
                    }}
                    onLimitChange={(newLimit) => {
                        updateParams({ limit: newLimit, page: 1 });
                    }}
                    onRowClick={handleRowClick}
                />
            )}
        </div>
    );
};

export default All_Stores;
