import api from "../api/api";

function ProductList({ products, refresh }) {

    const remove = async (id) => {

        await api.delete(`/products/${id}`);

        refresh();

    };

    return (

        <table>

            <thead>

                <tr>

                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th></th>

                </tr>

            </thead>

            <tbody>

                {products.map(product => (

                    <tr key={product.id}>

                        <td>{product.id}</td>

                        <td>{product.name}</td>

                        <td>${product.price}</td>

                        <td>

                            <button
                                onClick={() => remove(product.id)}
                            >
                                Delete
                            </button>

                        </td>

                    </tr>

                ))}

            </tbody>

        </table>

    );

}

export default ProductList;