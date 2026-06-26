import { useState } from "react";
import api from "../api/api";

function ProductForm({ refresh }) {

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");

    const submit = async (e) => {

        e.preventDefault();

        await api.post("/products", {
            name,
            price: Number(price)
        });

        setName("");
        setPrice("");

        refresh();

    };

    return (

        <form onSubmit={submit}>

            <input
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                placeholder="Price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />

            <button>Add Product</button>

        </form>

    );

}

export default ProductForm;