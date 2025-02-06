import React, { useState } from 'react';
import { fetchBigQueryData } from './BigQueryClient';
import 'bootstrap/dist/css/bootstrap.min.css'; 

const BigQueryComponent = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [queryParams, setQueryParams] = useState({
        routeId: '',
        routeName: '',
        cityId: '',
        cityName: '',
        startDate: '',
        endDate: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQueryParams({
            ...queryParams,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await fetchBigQueryData(queryParams);
            setData(result);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h4 className="mb-4">BigQuery Data Fetcher</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Route ID</label>
                    <input type="text" name="routeId" className="form-control" value={queryParams.routeId} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>Route Name</label>
                    <input type="text" name="routeName" className="form-control" value={queryParams.routeName} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>City ID</label>
                    <input type="text" name="cityId" className="form-control" value={queryParams.cityId} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>City Name</label>
                    <input type="text" name="cityName" className="form-control" value={queryParams.cityName} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" name="startDate" className="form-control" value={queryParams.startDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>End Date</label>
                    <input type="date" name="endDate" className="form-control" value={queryParams.endDate} onChange={handleInputChange} />
                </div>
                <button type="submit" className="btn btn-primary mt-3">Fetch Data</button>
            </form>
            {loading ? (
                <div className="mt-4">Loading...</div>
            ) : (
                <table className="table table-striped mt-4">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Route ID</th>
                            <th>Route Name</th>
                            <th>City ID</th>
                            <th>City Name</th>
                            <th>User ID</th>
                            <th>Date Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                            <tr key={row.id}>
                                <td>{row.id}</td>
                                <td>{row.route_id}</td>
                                <td>{row.route_name}</td>
                                <td>{row.city_id}</td>
                                <td>{row.city_name}</td>
                                <td>{row.user_id}</td>
                                <td>{new Date(row.date_time).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default BigQueryComponent;
