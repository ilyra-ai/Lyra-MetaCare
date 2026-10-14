# Base de cidades

`cidades.json.gz` é a base usada para escolher o local de nascimento e de moradia (coordenadas e fuso horário) do mapa védico. Fica no próprio projeto: a busca não envia o local da pessoa a nenhum serviço externo.

- **Fonte:** [GeoNames](https://www.geonames.org), licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Atribuição obrigatória: "Dados de cidades © GeoNames".
- **Conteúdo:** cidades com mais de 5.000 habitantes no mundo e, no Brasil, também as com mais de 1.000 habitantes e as sedes de município. Cada cidade tem id do GeoNames, nome, país, estado, latitude, longitude, fuso IANA e população.
- **Atualizar:** `pnpm geo:cidades` (baixa de `download.geonames.org` e regrava o arquivo).
