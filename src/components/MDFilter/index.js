import React, { useState, useEffect } from 'react';

const Filtro = ({ onFilterChange }) => {
    const [selected, setSelected] = useState({ carga: true, compra: true });

    useEffect(() => {
        onFilterChange(selected);
    }, []);

    const handleChange = (event) => {
        const newSelected = { ...selected, [event.target.name]: event.target.checked };
        setSelected(newSelected);
        onFilterChange(newSelected);
    };


    return (
        <div style={{ marginTop: '-20px' }}>
            <h4 style={{ fontWeight: 'bold' }} > Filtrar por:</h4>
            <label style={{ marginRight: '20px' }} >
                <input type="checkbox" name="carga" checked={selected.carga} onChange={handleChange} />
                <h5 style={{ display: 'inline' }} > Carga </h5>
            </label>
            <label style={{ marginRight: '20px' }} >
                <input type="checkbox" name="compra" checked={selected.compra} onChange={handleChange} />
                <h5 style={{ display: 'inline' }} > Compra </h5>
            </label>
        </div>
    );
};

export default Filtro;
