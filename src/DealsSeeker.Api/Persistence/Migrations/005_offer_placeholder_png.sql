UPDATE offer_images
SET image_url = '/images/offer-placeholder.svg',
    mime_type = 'image/svg+xml',
    width = 800,
    height = 500
WHERE image_url IN (
    '/images/offer-placeholder.svg',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABGSURBVEhLY6jxNf1PS8yALkBtPEwtsFOTJgujmzOMLaAmHqYWoIctsRjdnGFsATXxMLUAPWyJxejmDGMLqIlHLSCIaW4BAJj4Ovv+Oxb0AAAAAElFTkSuQmCC'
);
