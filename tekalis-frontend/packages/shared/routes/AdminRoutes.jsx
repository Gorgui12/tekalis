import { Routes, Route, Navigate } from 'react-router-dom';

// Pages admin
import Dashboard    from '../../apps/admin/src/pages/Dashboard/Dashboard';
import Orders       from '../../apps/admin/src/pages/Orders/Orders';
import OrderDetail  from '../../apps/admin/src/pages/Orders/OrderDetail';
import Products     from '../../apps/admin/src/pages/Products/Products';
import AddProduct   from '../../apps/admin/src/pages/Products/AddProduct';
import EditProduct  from '../../apps/admin/src/pages/Products/EditProduct';
import SAV          from '../../apps/admin/src/pages/SAV/SAV';
import SAVDetail    from '../../apps/admin/src/pages/SAV/SAVDetail';
import Warranties   from '../../apps/admin/src/pages/Warranties/Warranties';
import Blog         from '../../apps/admin/src/pages/Blog/Blog';
import AddArticle   from '../../apps/admin/src/pages/Blog/AddArticle';
import EditArticle  from '../../apps/admin/src/pages/Blog/EditArticle';
import Analytics    from '../../apps/admin/src/pages/Analytics/Analytics';

const AdminRoutes = () => (
  <Routes>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard"            element={<Dashboard />} />

    <Route path="orders"               element={<Orders />} />
    <Route path="orders/:id"           element={<OrderDetail />} />

    <Route path="products"             element={<Products />} />
    <Route path="products/add"         element={<AddProduct />} />
    <Route path="products/edit/:id"    element={<EditProduct />} />

    <Route path="sav"                  element={<SAV />} />
    <Route path="sav/:id"              element={<SAVDetail />} />

    <Route path="warranties"           element={<Warranties />} />

    <Route path="blog"                 element={<Blog />} />
    <Route path="blog/add"             element={<AddArticle />} />
    <Route path="blog/edit/:id"        element={<EditArticle />} />

    <Route path="analytics"            element={<Analytics />} />

    {/* Fallback */}
    <Route path="*"                    element={<Navigate to="dashboard" replace />} />
  </Routes>
);

export default AdminRoutes;