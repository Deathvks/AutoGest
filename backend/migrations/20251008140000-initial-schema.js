'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ownerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'admin', 'technician', 'technician_subscribed'),
        allowNull: false,
        defaultValue: 'user'
      },
      previousRole: {
        type: Sequelize.ENUM('user', 'admin', 'technician', 'technician_subscribed'),
        allowNull: true
      },
      avatarUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      logoUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      businessName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dni: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cif: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      subscriptionStatus: {
        type: Sequelize.ENUM('inactive', 'active', 'cancelled', 'past_due'),
        allowNull: false,
        defaultValue: 'inactive'
      },
      subscriptionExpiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      stripeCustomerId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      invoiceCounter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      proformaCounter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      verificationCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      resetPasswordToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      resetPasswordExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      canManageRoles: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      canExpelUsers: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Cars', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      make: {
        type: Sequelize.STRING,
        allowNull: false
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      purchasePrice: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      salePrice: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      reservationDeposit: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('En venta', 'Vendido', 'Reservado', 'Taller'),
        allowNull: false,
        defaultValue: 'En venta'
      },
      location: {
        type: Sequelize.STRING
      },
      km: {
        type: Sequelize.INTEGER
      },
      fuel: {
        type: Sequelize.STRING
      },
      horsepower: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      registrationDate: {
        type: Sequelize.DATEONLY
      },
      licensePlate: {
        type: Sequelize.STRING,
        unique: 'unique_licensePlate'
      },
      vin: {
        type: Sequelize.STRING,
        unique: 'unique_vin'
      },
      transmission: {
        type: Sequelize.STRING
      },
      notes: {
        type: Sequelize.TEXT
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      technicalSheetUrl: {
        type: Sequelize.JSON,
        allowNull: true
      },
      registrationCertificateUrl: {
        type: Sequelize.JSON,
        allowNull: true
      },
      otherDocumentsUrls: {
        type: Sequelize.JSON,
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON
      },
      hasInsurance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      keys: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      saleDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      buyerDetails: {
        type: Sequelize.JSON,
        allowNull: true
      },
      reservationExpiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reservationPdfUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gestoriaPickupDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      gestoriaReturnDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      invoiceNumber: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      proformaNumber: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Expenses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      carLicensePlate: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'Cars',
          key: 'licensePlate'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      isRecurring: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      recurrenceType: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'custom'),
        allowNull: true
      },
      recurrenceCustomValue: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      recurrenceEndDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      nextRecurrenceDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Incidents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      licensePlate: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('abierta', 'resuelta'),
        allowNull: false,
        defaultValue: 'abierta'
      },
      carId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Cars',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Invitations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      inviterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'expired'),
        defaultValue: 'pending'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Invitations');
    await queryInterface.dropTable('Locations');
    await queryInterface.dropTable('Incidents');
    await queryInterface.dropTable('Expenses');
    await queryInterface.dropTable('Cars');
    await queryInterface.dropTable('Users');
    await queryInterface.dropTable('Companies');
  }
};