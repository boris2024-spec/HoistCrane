import io
import qrcode
from qrcode.image.svg import SvgImage


def generate_qr_code(data: str, fmt: str = 'png') -> bytes:
    """Generate a QR code image from the given data string.
    
    Args:
        data: The string data to encode in the QR code.
        fmt: Output format - 'png' or 'svg'.
    
    Returns:
        Bytes of the generated image.
    """
    if fmt == 'svg':
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(image_factory=SvgImage)
        buf = io.BytesIO()
        img.save(buf)
        return buf.getvalue()
    else:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color='black', back_color='white')
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        return buf.getvalue()
