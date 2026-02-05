const pool = require('../database/')

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
    try{
        const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
        return data.rows
    }
    catch (error){
        console.error("getClassifications error: " + error)
        return []
    }
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id){
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getInventoryByClassificationId error: " + error)
        return []
    }
}

/* ***************************
 *  Get inventory item by inv_id
 * ************************** */
async function getInventoryByInvId(inv_id){
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.inv_id = $1`,
            [inv_id]
        )
        return data.rows
    } catch (error) {
        console.error("getInventoryByInvId error: " + error)
    }
}

// ---------------------------
// Check Existing Classification Name
// ---------------------------
async function checkExistingClassification(classification_name){
    try {
        const sql = "SELECT classification_name FROM public.classification WHERE classification_name = $1"
        const values = [classification_name]
        const classification = await pool.query(sql, values)
        return classification.rowCount > 0
    } catch (error) {
        console.error("checkExistingClassification error: " + error)
    }
}

// ---------------------------
// Check Existing Classification Id
// ---------------------------
async function checkExistingClassificationId(classification_id){
    try {
        const sql = "SELECT classification_id FROM public.classification WHERE classification_id = $1"
        const values = [classification_id]
        const classification = await pool.query(sql, values)
        return classification.rowCount > 0
    } catch (error) {
        console.error("checkExistingClassificationId error: " + error)
    }
}

// ---------------------------
// Add New Classification
// ---------------------------
async function addClassification(classification_name){
    try {
        const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
        const values = [classification_name]
        const result = await pool.query(sql, values)
        return result.rows[0]
    } catch (error) {
        console.error("addClassification error: " + error)
    }
}

// ---------------------------
// Add New Vehicle
// ---------------------------
async function addVehicle(vehicleData){
    try {

        const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = vehicleData


        const sql = `INSERT INTO public.inventory 
        (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *`

        const values = [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id]

        const result = await pool.query(sql, values)
        
        return result.rows[0]
    } catch (error) {
        console.error("addVehicle error: " + error)
    }
}


// ---------------------------
// Edit inventory vehicle
// ---------------------------
async function editInventory(vehicleData){
    try {

        const { inv_id, classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = vehicleData


        const sql = `UPDATE public.inventory SET 
        inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_miles = $8, inv_color = $9, classification_id = $10
        WHERE inv_id = $11
        RETURNING *`

        const values = [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id]
        const result = await pool.query(sql, values)
        
        return result.rows[0]
    } catch (error) {
        console.error("editInventory error: " + error)
    }
}

// ---------------------------
// Delete inventory vehicle
// ---------------------------
async function deleteInventory(vehicleData){
    try {

        const { inv_id } = vehicleData


        const sql = `DELETE FROM public.inventory 
        WHERE inv_id = $1
        RETURNING *`

        const values = [inv_id]
        const result = await pool.query(sql, values)
        
        return result
    } catch (error) {
        console.error("deleteInventory error: " + error)
    }
}

module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByInvId, checkExistingClassification, checkExistingClassificationId, addClassification, addVehicle, editInventory, deleteInventory}