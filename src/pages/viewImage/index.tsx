import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios, { isAxiosError } from 'axios';
import Loading from '../../component/loader'

const Image = () => {
    const params = useParams();
    const imageId = params.imageId;
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                setIsLoading(true)
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/image/${imageId}`, {
                    responseType: 'blob',
                });
                setImageUrl(URL.createObjectURL(response.data));
            } catch (error) {
                if (isAxiosError(error) && error.response) {
                    if (error.response.status === 401)
                        setError('Not Logged in')
                    if (error.response.status === 403)
                        setError('Access Denied');
                } else {
                    setError('Image not found');
                }
            } finally {
                setIsLoading(false)
            }
        };

        fetchImage();
    }, [imageId]);

    return (
        <div className="w-full h-screen flex items-center justify-center">
            {
                isLoading ?
                    <div><Loading /></div>
                    :
                    error ? (
                        <div>{error}</div>
                    ) : (
                        <img src={imageUrl} alt="" />
                    )}
        </div>
    );
};

export default Image;
