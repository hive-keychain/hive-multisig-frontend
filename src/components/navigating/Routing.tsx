import { Navigate, Route, Routes } from 'react-router-dom';
import LoginForm from '../account/LoginForm';
import { HomePage, SearchBar } from '../account/SearchPage';
import { TransactionPage } from '../account/TransactionsPage';
const Routing = () => {
  return (
    <Routes>
      <Route path="/@:id" element={<HomePage />} />
      <Route path="/transaction" element={<TransactionPage />} />
      <Route path="/search" element={<SearchBar />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/" element={<Navigate to={'/login'} />} />
    </Routes>
  );
};

export default Routing;
