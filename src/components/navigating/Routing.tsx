import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

const LoginForm = lazy(() => import('../page/LoginForm'));

const HomePage = lazy(() =>
  import('../page/SearchPage').then((m) => ({ default: m.HomePage })),
);

const SearchBar = lazy(() =>
  import('../page/SearchPage').then((m) => ({ default: m.SearchBar })),
);

const SignRequestsPage = lazy(() =>
  import('../page/SignRequestPage').then((m) => ({ default: m.SignRequestsPage })),
);

const TransactionPage = lazy(() =>
  import('../page/TransactionsPage').then((m) => ({ default: m.TransactionPage })),
);

const TwoFactorAuthPage = lazy(() =>
  import('../page/TwoFactorAuthPage').then((m) => ({ default: m.TwoFactorAuthPage })),
);

const Routing = () => {
  return (
    <div>
      <Suspense
        fallback={
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '40vh' }}>
            <Spinner animation="border" role="status" />
            <span className="ms-2">Loading…</span>
          </div>
        }>
        <Routes>
          <Route path="/:id" element={<HomePage />} />
          <Route path="/search" element={<SearchBar />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/transaction" element={<TransactionPage />} />
          <Route path="/signRequest" element={<SignRequestsPage />} />
          <Route path="/twoFactor" element={<TwoFactorAuthPage />} />
          <Route path="/" element={<Navigate to={'/login'} />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default Routing;
