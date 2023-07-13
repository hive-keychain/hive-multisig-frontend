import { Navigate, Route, Routes } from 'react-router-dom';
import LoginForm from '../page/LoginForm';
import { HomePage, SearchBar } from '../page/SearchPage';
import { SignRequestsPage } from '../page/SignRequestPage';
import { TransactionPage } from '../page/TransactionsPage';
const Routing = () => {
  return (
    <Routes>
      <Route path="/@:id" element={<HomePage />} />
      <Route path="/transaction" element={<TransactionPage />} />
      <Route path="/signRequest" element={<SignRequestsPage />} />
      <Route path="/search" element={<SearchBar />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/" element={<Navigate to={'/login'} />} />
    </Routes>
  );
};

export default Routing;
