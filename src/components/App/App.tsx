import { useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import ReactPaginateModule from 'react-paginate';
import type { ReactPaginateProps } from 'react-paginate';
import type { ComponentType } from 'react';

import SearchBar from '../SearchBar/SearchBar';
import MovieGrid from '../MovieGrid/MovieGrid';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieModal from '../MovieModal/MovieModal';

import { fetchMovies } from '../../services/movieService';
import type { Movie } from '../../types/movie';

import css from './App.module.css';

type ModuleWithDefault<T> = { default: T };

const ReactPaginate = (
  ReactPaginateModule as unknown as
    ModuleWithDefault<ComponentType<ReactPaginateProps>>
).default;

export default function App() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isPending, isError } = useQuery({
  queryKey: ['movies', query, page],
  queryFn: () => fetchMovies(query, page),
  enabled: query.length > 0,
  placeholderData: keepPreviousData,
});

  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;

  useEffect(() => {
    if (data && movies.length === 0) {
      toast.error('No movies found for your request.');
    }
  }, [data, movies.length]);

  const handleSearch = (searchQuery: string): void => {
    setQuery(searchQuery.trim());
    setPage(1);
    setSelectedMovie(null);
  };

  const handleSelectMovie = (movie: Movie): void => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = (): void => {
    setSelectedMovie(null);
  };

  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleSearch} />

      {query && isPending && <Loader />}

      {query && isError && <ErrorMessage />}

      {query && !isPending && !isError && movies.length > 0 && (
        <MovieGrid
          movies={movies}
          onSelect={handleSelectMovie}
        />
      )}

      {query && !isPending && !isError && totalPages > 1 && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => {
            setPage(selected + 1);
            setSelectedMovie(null);
          }}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={handleCloseModal}
        />
      )}

      <Toaster position="top-right" />
    </div>
  );
}