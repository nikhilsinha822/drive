import axios, { isAxiosError } from "axios";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuid } from 'uuid'
import { FaFolder, FaFolderPlus } from "react-icons/fa";
import { FaImage } from "react-icons/fa6";
import { MdClose } from "react-icons/md";

type displayFoldersType = {
    _id: string;
    name: string;
    owner: string;
    parent: string | null;
}

type displayImagesType = {
    _id: string;
    name: string;
    owner: string;
    parent: string | null;
    createdAt: string;
    updatedAt: string;
}

type ImageDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    displayImages: displayImagesType[] | null
    setDisplayImages: React.Dispatch<React.SetStateAction<displayImagesType[] | null>>
}


const Home = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const folderId = searchParams.get('folder');
    const [displayFolders, setDisplayFolders] = useState<displayFoldersType[] | null>(null);
    const [displayImages, setDisplayImages] = useState<displayImagesType[] | null>(null);
    const [newFolder, setNewFolder] = useState('');
    const [isNewFolder, setIsNewFolder] = useState(false);
    const [error, setError] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const navigate = useNavigate();

    const setQueryParam = (key: string, value: string) => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set(key, value);
        navigate({
            pathname: window.location.pathname,
            search: searchParams.toString()
        });
    };

    const handleCreateFolder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/folder/create`, {
                name: newFolder,
                parent: folderId
            })

            const newDisplayFolders = displayFolders ? [response.data.data, ...displayFolders] : [response.data.data.folder];
            setDisplayFolders(newDisplayFolders)
            setNewFolder('')
            setIsNewFolder(false)
        } catch (error) {
            console.log(error)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setNewFolder(value)
    }

    useEffect(() => {
        const fetchFolder = async () => {
            try {
                const url = folderId ?
                    `${import.meta.env.VITE_BASE_URL}/folder?folderId=${folderId}` :
                    `${import.meta.env.VITE_BASE_URL}/folder`

                const response = await axios.get(url)
                setDisplayFolders(response.data.data.folder)
                setDisplayImages(response.data.data.images)
            } catch (err) {
                if (isAxiosError(err) && err.response) {
                    if (err.response.status === 401)
                        navigate('/login')
                    else if (err.response.status === 403)
                        setError('Access Denied');
                } else {
                    setError("Internal Server Error")
                }
            }
        }

        fetchFolder();
    }, [folderId, error, navigate])

    if (error)
        return <div>{error}</div>

    return (
        <div className="">
            <div className="flex justify-center space-x-4 mt-4">
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                >
                    Upload Image
                </button>
            </div>
            <div className="border border-gray-400 rounded-md p-10 m-5 mx-auto md:w-4/5">
                {
                    (displayImages && displayFolders && displayFolders?.length + displayImages?.length == 0) &&
                    <div>Folder is empty.</div>
                }
                {
                    isNewFolder ?
                        <form onSubmit={handleCreateFolder} className="flex gap-2 border-y p-2 border-gray-400">
                            <FaFolder className="text-yellow-500 text-2xl" />
                            <input type="text"
                                onChange={handleChange}
                                value={newFolder}
                                className="border-b border-gray-400" />
                        </form> :
                        <div
                            onClick={() => setIsNewFolder(true)}
                            className="flex items-center font-semibold gap-2 border-y p-2 border-gray-400 hover:cursor-pointer">
                            <FaFolderPlus className="text-blue-400 text-2xl" />
                            Add New Folder
                        </div>
                }
                {
                    displayFolders && displayFolders.map((obj) => {
                        return <div
                            key={uuid()}
                            className="flex gap-2 border-y p-2 border-gray-400 hover:opacity-50 hover:cursor-pointer"
                            onClick={() => setQueryParam("folder", obj._id)}>
                            <FaFolder className="text-yellow-500 text-2xl" />
                            <div>{obj.name}</div>
                        </div>
                    })
                }
                {
                    displayImages && displayImages.map((obj) => {
                        return <div
                            key={uuid()}
                            className="flex gap-2 border-y p-2 hover:opacity-50 hover:cursor-pointer"
                            onClick={() => navigate(`/image/${obj._id}`)}>
                            <FaImage className="text-red-700 text-2xl" />
                            <div>{obj.name}</div>
                        </div>
                    })
                }
            </div>
            <ImageDialog
                onClose={() => setIsDialogOpen(false)}
                isOpen={isDialogOpen}
                displayImages={displayImages}
                setDisplayImages={setDisplayImages}
            />
        </div>
    )
}

const ImageDialog: React.FC<ImageDialogProps> = ({ isOpen, onClose, displayImages, setDisplayImages }) => {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newImages = Array.from(event.target.files);
            setSelectedImages((prevImages) => [...prevImages, ...newImages]);
        }
    };

    const handleUpload = async () => {
        try {
            setIsLoading(true)
            const formData = new FormData();
            selectedImages.forEach((image) => {
                formData.append('images', image);
                console.log("data", formData)
            });

            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/image/new`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            const newDisplayImages = displayImages ? [response.data.data, ...displayImages] : [response.data.data.folder];
            setDisplayImages(newDisplayImages);
            setSelectedImages([]);
            onClose();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-10 p-5 overflow-hidden flex items-center justify-center bg-black bg-opacity-50">
            {isLoading && <div className="absolute bg-gray-500 opacity-50 w-full h-full z-50"> Loading... </div>}
            <div className="bg-white rounded-lg max-h-full overflow-scroll p-6 w-full max-w-lg">

                <div className="flex justify-between ">
                    <h2 className="text-2xl font-bold mb-4">Selected Images</h2>
                    <MdClose
                        onClick={() => {
                            setSelectedImages([])
                            onClose()
                        }}
                        className="hover:cursor-pointer text-2xl" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {selectedImages.map((image, index) => (
                        <img
                            key={index}
                            src={URL.createObjectURL(image)}
                            alt={`Selected ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                        />
                    ))}
                </div>
                <div className="flex flex-col justify-between items-center w-full">
                    {
                        !selectedImages.length ? <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        >
                            Browse
                        </button> :
                            <button
                                onClick={handleUpload}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Upload
                            </button>
                    }
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="hidden"
                />
            </div>
        </div>
    );
};



export default Home