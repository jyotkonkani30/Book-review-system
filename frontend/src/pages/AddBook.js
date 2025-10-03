import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../context/BookContext';

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    publishedYear: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const { isAuthenticated } = useAuth();
  const { createBook } = useBooks();
  const navigate = useNavigate();

  const genres = [
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'Romance',
    'Science Fiction',
    'Fantasy',
    'Thriller',
    'Biography',
    'History',
    'Self-Help',
    'Business',
    'Technology',
    'Other'
  ];

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const { title, author, description, genre, publishedYear } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.trim().length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }

    if (!author.trim()) {
      errors.author = 'Author is required';
    } else if (author.trim().length > 100) {
      errors.author = 'Author name must be less than 100 characters';
    }

    if (!description.trim()) {
      errors.description = 'Description is required';
    } else if (description.trim().length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    if (!genre) {
      errors.genre = 'Please select a genre';
    }

    if (!publishedYear) {
      errors.publishedYear = 'Published year is required';
    } else {
      const year = parseInt(publishedYear);
      if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
        errors.publishedYear = 'Please enter a valid year';
      }
    }

    return errors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    setFormErrors({});
    
    const bookData = {
      title: title.trim(),
      author: author.trim(),
      description: description.trim(),
      genre,
      publishedYear: parseInt(publishedYear),
    };

    const result = await createBook(bookData);
    
    if (result.success) {
      navigate('/');
    } else {
      setFormErrors({ submit: result.message });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Add New Book
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Share a book with the community
            </p>
          </div>

          {formErrors.submit && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {formErrors.submit}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Book Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  formErrors.title ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
                placeholder="Enter the book title"
                value={title}
                onChange={onChange}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  formErrors.author ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
                placeholder="Enter the author's name"
                value={author}
                onChange={onChange}
              />
              {formErrors.author && (
                <p className="mt-1 text-sm text-red-600">{formErrors.author}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  formErrors.description ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
                placeholder="Enter a brief description of the book"
                value={description}
                onChange={onChange}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {description.length}/1000 characters
              </p>
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Genre *
                </label>
                <select
                  id="genre"
                  name="genre"
                  required
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formErrors.genre ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  value={genre}
                  onChange={onChange}
                >
                  <option value="">Select a genre</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {formErrors.genre && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.genre}</p>
                )}
              </div>

              <div>
                <label htmlFor="publishedYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Published Year *
                </label>
                <input
                  type="number"
                  id="publishedYear"
                  name="publishedYear"
                  required
                  min="1000"
                  max={new Date().getFullYear()}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formErrors.publishedYear ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
                  placeholder="e.g., 2023"
                  value={publishedYear}
                  onChange={onChange}
                />
                {formErrors.publishedYear && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.publishedYear}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Book...
                  </div>
                ) : (
                  'Add Book'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBook;