/**
 * Helper para formatar o link do WhatsApp com mensagem automática
 */
export function getWhatsappLink(phone: string, productName?: string): string {
  // Limpa o número removendo tudo que não for dígito
  const cleanPhone = phone.replace(/\D/g, '');
  
  let message = "Olá! Gostaria de mais informações sobre os produtos da DoLe Arte.";
  if (productName) {
    message = `Olá! Tenho interesse na ${productName}.`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
