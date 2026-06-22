import { useEffect, useState } from "react";

import api from "./api/api";

import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";

import "./App.css"

function App() {

    const [products, setProducts] = useState([]);

    const loadProducts = async () => {

        const response = await api.get("/products");

        setProducts(response.data);

    };

    useEffect(() => {

        loadProducts();

    }, []);

    return (

        <div className="container">

            <h1>Product Dashboard</h1>

            <ProductForm refresh={loadProducts} />

            <ProductList
                products={products}
                refresh={loadProducts}
            />

        </div>

    );

}

export default App;