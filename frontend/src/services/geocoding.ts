export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
      { headers: { 'Accept-Language': 'es' } }
    );
    const data = await res.json();
    if (!data?.address) return '';
    const { road, house_number, suburb, city, town, village } = data.address;
    const calle = road ? (house_number ? `${road} ${house_number}` : road) : '';
    const barrio = suburb ?? '';
    const localidad = city ?? town ?? village ?? '';
    return [calle, barrio, localidad].filter(Boolean).join(', ');
  } catch {
    return '';
  }
}
