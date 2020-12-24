
function printMinutes(data) {
  if (data < 10) {
    return `0${data}`;
  }
  return data;
}

export function minsToHrs(data) {
  if (data) {
    const hours = Math.floor(data / 60);
    const minutes = data % 60;
    return `${hours}:${printMinutes(minutes)}`;
  }
  return data;
}

export function toTitleCase(data) {
  const response = data.replace(/_/g, ' ');
  return response.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export function timeSince(data) {
  const seconds = Math.floor((new Date() - new Date(data)) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) {
    return `${interval} año${interval > 1 ? 's' : ''}`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} mes${interval > 1 ? 'es' : ''}`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} día${interval > 1 ? 's' : ''}`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} hora${interval > 1 ? 's' : ''}`;
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} minutos`;
  }
  return `1 minuto`;
}

export function truncate(string, limit) {
  return (string.length > limit) ? string.substr(0, limit - 1) + '...' : string;
}

export function cleanString(string) {
  let response = string.replace(/["'´®\(\)-]/g, '');
  response = response.replace(/[á]/g, 'a').replace(/[Á]/g, 'A');
  response = response.replace(/[é]/g, 'e').replace(/[É]/g, 'E');
  response = response.replace(/[í]/g, 'i').replace(/[Í]/g, 'I');
  response = response.replace(/[ó]/g, 'o').replace(/[Ó]/g, 'O');
  response = response.replace(/[ú]/g, 'u').replace(/[Ú]/g, 'U');
  response = response.replace(/[ñ]/g, 'n').replace(/[Ñ]/g, 'N');
  return response;
}
