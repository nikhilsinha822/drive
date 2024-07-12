import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
import { FaImage, FaSearch } from "react-icons/fa";
import { v4 as uuid } from "uuid";
import { useDebounce } from 'use-debounce';
import Loading from '../../component/loader'

type displayImagesType = {
    _id: string;
    name: string;
    owner: string;
    parent: string | null;
    createdAt: string;
    updatedAt: string;
}

const Search = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    const [displayImages, setDisplayImages] = useState<displayImagesType[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(query);
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    useEffect(() => {
        const fetchImages = async () => {
            if (!debouncedSearchTerm) {
                setDisplayImages(null);
                return;
            }
            try {
                setIsLoading(true);
                const url = `${import.meta.env.VITE_BASE_URL}/image/search?image=${debouncedSearchTerm}`;
                const response = await axios.get(url);
                setDisplayImages(response.data.data);
            } catch (err) {
                if (isAxiosError(err) && err.response) {
                    if (err.response.status === 401)
                        navigate('/login')
                }
                console.log(err);
                setDisplayImages(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();

        navigate(`/search?q=${debouncedSearchTerm}`, { replace: true });
    }, [debouncedSearchTerm, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="mx-auto max-w-2xl mt-8 px-4">
            <div className="mb-6">
                <div className="relative">
                    <input
                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
                        type="text"
                        placeholder="Search images..."
                        aria-label="Search images"
                        value={searchTerm}
                        onChange={handleChange}
                    />
                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-4 text-gray-500"><Loading/></div>
            ) : (
                <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {!displayImages?.length ? (
                        <div className="text-center py-4 text-gray-500">No images found</div>
                    ) : (
                        displayImages.map((obj) => (
                            <div
                                key={uuid()}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                onClick={() => navigate(`/image/${obj._id}`)}
                            >
                                <FaImage className="text-red-500 text-xl flex-shrink-0" />
                                <div className="text-gray-700 truncate">{obj.name}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;