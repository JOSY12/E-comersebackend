const { Country, City, conn } = require('../db');

const getCountries = async (req, res) =>
{
    try
    {
        const countries = await Country.findAll({ include: City });
        if (countries.length > 0)
            return res.status(200).json(countries);
        else
            return res.status(404, countries);
    } catch (error)
    {
        
        return res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}

const addCountry = async (req, res) =>
{
    const { name, cities } = req.body;
    const transaction = await conn.transaction();
    try
    {
        const [newCountry] = await Country.findOrCreate({
            where: { name },
            transaction
        });
        await Promise.all(cities.map(async city => await newCountry.createCity({ name: city.name }, { transaction })));

        await transaction.commit();

        const country = await Country.findOne({
            where: { name },
            include: [City]
        });

        return res.status(200).json(country);
    }
    catch (error)
    {
        await transaction.rollback();
       
        res.status(500).json({
            err: 'Algo salió terriblemente mal, estamos trabajando en ello',
            description: error
        })
    }
}

module.exports = {
    getCountries,
    addCountry
}