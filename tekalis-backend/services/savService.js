// ===============================================
// 11. services/savService.js
// ===============================================
const RMA = require("../models/RMA");
const Notification = require("../models/Notification");
const EmailService = require("./emailService");

class SAVService {
  // Créer une demande SAV avec workflow complet
  static async createRMAWithWorkflow(rmaData, user) {
    try {
      // Créer le RMA
      const rma = await RMA.create(rmaData);
      
      // Créer notification
      await Notification.create({
        user: user._id,
        type: "rma_created",
        title: "Demande SAV créée",
        message: `Votre demande ${rma.rmaNumber} a été créée avec succès`,
        link: `/rma/${rma._id}`,
        data: { rmaId: rma._id }
      });
      
      // Envoyer email au client
      await EmailService.sendRMANotification(user, rma, "created");
      
      // Envoyer notification à l'admin
      await EmailService.sendEmail(
        process.env.ADMIN_EMAIL,
        `Nouvelle demande SAV ${rma.rmaNumber}`,
        `<p>Type: ${rma.type}<br>Raison: ${rma.reason}<br>Client: ${user.name}</p>`
      );
      
      return rma;
    } catch (error) {
      console.error("Erreur createRMAWithWorkflow:", error);
      throw error;
    }
  }
  
  // Mettre à jour le statut avec notifications
  static async updateRMAStatus(rmaId, newStatus, adminId, note = "") {
    try {
      const rma = await RMA.findById(rmaId).populate("user", "name email");
      
      if (!rma) {
        throw new Error("RMA introuvable");
      }
      
      // Mettre à jour le statut
      rma.status = newStatus;
      rma.statusHistory.push({
        status: newStatus,
        updatedBy: adminId,
        note,
        updatedAt: new Date()
      });
      
      await rma.save();
      
      // Créer notification pour le client
      await Notification.create({
        user: rma.user._id,
        type: "rma_updated",
        title: "Mise à jour de votre demande SAV",
        message: `Statut: ${this.getStatusLabel(newStatus)}`,
        link: `/rma/${rma._id}`,
        data: { rmaId: rma._id }
      });
      
      // Envoyer email
      await EmailService.sendRMANotification(rma.user, rma, "updated");
      
      return rma;
    } catch (error) {
      console.error("Erreur updateRMAStatus:", error);
      throw error;
    }
  }
  
  // Obtenir le label du statut
  static getStatusLabel(status) {
    const labels = {
      pending: "En attente",
      approved: "Approuvée",
      rejected: "Rejetée",
      in_transit: "En transit",
      received: "Reçue",
      processing: "En traitement",
      resolved: "Résolue",
      cancelled: "Annulée"
    };
    return labels[status] || status;
  }
  
  // Obtenir le type de demande
  static getTypeLabel(type) {
    const labels = {
      retour: "Retour",
      reparation: "Réparation",
      echange: "Échange"
    };
    return labels[type] || type;
  }
  
  // Vérifier l'éligibilité au retour
  static canReturn(orderDate, returnPeriodDays = 14) {
    const daysSinceOrder = Math.ceil(
      (new Date() - orderDate) / (1000 * 60 * 60 * 24)
    );
    return daysSinceOrder <= returnPeriodDays;
  }
}

module.exports = SAVService;

