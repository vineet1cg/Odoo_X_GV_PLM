const express = require('express');
const BOM = require('../models/BOM');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'Operations User') {
      query.status = 'Active';
    }

    const boms = await BOM.find(query)
      .populate('productId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: boms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BOMs'
    });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id).populate('productId');

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    if (req.user.role === 'Operations User' && bom.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view active BOMs.'
      });
    }

    res.json({
      success: true,
      data: bom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BOM'
    });
  }
});

module.exports = router;
