const ECO = require('../models/ECO');
const Product = require('../models/Product');
const BOM = require('../models/BOM');
const { createNotification } = require('./notificationService');
const User = require('../models/User');

const generateEcoNumber = async () => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `ECO-${currentYear}-`;

  const count = await ECO.countDocuments({
    ecoNumber: { $regex: `^${yearPrefix}` }
  });

  const nextNumber = (count + 1).toString().padStart(3, '0');
  return `${yearPrefix}${nextNumber}`;
};

const applyECO = async (ecoId, userId) => {
  try {
    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (!eco.ecoNumber) {
      eco.ecoNumber = await generateEcoNumber();
    }

    const product = await Product.findById(eco.productId);
    if (!product) throw new Error('Associated product not found');

    if (eco.versionUpdate) {
      const currentVersionNum = parseInt(product.version.replace('v', ''), 10) || 1;
      const newVersionNum = currentVersionNum + 1;
      const newVersionStr = eco.newVersion || `v${newVersionNum}`;

      if (eco.type === 'Product') {
        for (const change of eco.changes) {
          if (change.changeType === 'modified' || change.changeType === 'added') {
            const fieldName = change.fieldName.toLowerCase();
            if (product.schema.paths[fieldName]) {
              product[fieldName] = change.newValue;
            }
          }
        }

        product.version = newVersionStr;

        product.versions.push({
          version: newVersionStr,
          date: new Date(),
          changedBy: user.name,
          ecoId: eco._id.toString(),
          summary: eco.title
        });

        await product.save();
      }

      if (eco.type === 'BoM' && eco.bomId) {
        const bom = await BOM.findById(eco.bomId);
        if (bom) {
          for (const change of eco.changes) {
            if (change.fieldName && change.fieldName.startsWith('component.')) {
              const componentName = change.fieldName.replace('component.', '');
              const existingComponent = bom.components.find(c => c.name === componentName);

              if (change.changeType === 'modified' && existingComponent) {
                const quantityMatch = change.newValue.match(/(\d+)/);
                if (quantityMatch) {
                  existingComponent.quantity = parseInt(quantityMatch[1], 10);
                }
              } else if (change.changeType === 'added') {
                bom.components.push({
                  id: `comp-${Date.now()}`,
                  name: componentName,
                  partNumber: `PN-${componentName.toUpperCase().replace(/\s/g, '-')}`,
                  quantity: parseInt(change.newValue, 10) || 1,
                  unit: 'pcs',
                  cost: 0
                });
              } else if (change.changeType === 'removed' && existingComponent) {
                bom.components = bom.components.filter(c => c.name !== componentName);
              }
            }
          }

          bom.version = newVersionStr;
          await bom.save();

          product.version = newVersionStr;
          product.versions.push({
            version: newVersionStr,
            date: new Date(),
            changedBy: user.name,
            ecoId: eco._id.toString(),
            summary: eco.title
          });
          await product.save();
        }
      }

      eco.newVersion = newVersionStr;
    } else {
      if (eco.type === 'Product') {
        for (const change of eco.changes) {
          if (change.changeType === 'modified' || change.changeType === 'added') {
            const fieldName = change.fieldName.toLowerCase();
            if (product.schema.paths[fieldName]) {
              product[fieldName] = change.newValue;
            }
          }
        }

        product.versions.push({
          version: product.version,
          date: new Date(),
          changedBy: user.name,
          ecoId: eco._id.toString(),
          summary: eco.title
        });

        await product.save();
      }

      if (eco.type === 'BoM' && eco.bomId) {
        const bom = await BOM.findById(eco.bomId);
        if (bom) {
          for (const change of eco.changes) {
            if (change.fieldName && change.fieldName.startsWith('component.')) {
              const componentName = change.fieldName.replace('component.', '');
              const existingComponent = bom.components.find(c => c.name === componentName);

              if (change.changeType === 'modified' && existingComponent) {
                const quantityMatch = change.newValue.match(/(\d+)/);
                if (quantityMatch) {
                  existingComponent.quantity = parseInt(quantityMatch[1], 10);
                }
              }
            }
          }
          await bom.save();
        }
      }
    }

    eco.stage = 'Done';
    await eco.save();

    if (eco.createdBy) {
      await createNotification({
        userId: eco.createdBy,
        title: `ECO "${eco.title}" (${eco.ecoNumber}) has been approved and applied`,
        type: 'info',
        ecoId: eco._id
      });
    }

    return eco;
  } catch (error) {
    throw error;
  }
};

const addApprovalLog = async (ecoId, userName, action, comment = '') => {
  try {
    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');

    eco.approvalLogs.push({
      userName,
      action,
      timestamp: new Date(),
      comment
    });

    await eco.save();
    return eco;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateEcoNumber,
  applyECO,
  addApprovalLog
};
